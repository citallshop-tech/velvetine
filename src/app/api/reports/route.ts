import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { assessReport } from "@/lib/aiModeration";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const VALID_REASONS = [
  "FAKE_PROFILE",
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "UNDERAGE_SUSPECTED",
  "SCAM",
  "OTHER",
] as const;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  // Rate limited per account, not per IP - reports require being logged
  // in, so the account itself is the meaningful identity to throttle.
  const rateLimit = await checkRateLimit(`report:${userId}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "För många rapporter. Försök igen senare." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json();
  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;
  const reason = VALID_REASONS.includes(body.reason) ? body.reason : "OTHER";
  const details = typeof body.details === "string" ? body.details.slice(0, 2000) : null;

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: { reporterId: userId, reportedUserId: targetUserId, reason, details },
  });

  // Awaited so it's ready by the time admin looks at the queue - reports
  // aren't high-frequency enough for the extra second or two to matter,
  // and a background fire-and-forget call isn't reliably guaranteed to
  // finish in a serverless route handler.
  const assessment = await assessReport(reason, details);
  if (assessment) {
    await prisma.report.update({
      where: { id: report.id },
      data: {
        aiSeverity: assessment.severity,
        aiSummary: assessment.summary,
        aiReviewedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
