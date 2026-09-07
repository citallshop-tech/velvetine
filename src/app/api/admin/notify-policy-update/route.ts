import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { sendPolicyUpdateEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim()
      : "Vi har uppdaterat våra villkor och vår integritetspolicy.";

  const origin = request.nextUrl.origin;
  const termsUrl = `${origin}/sv/villkor`;
  const privacyUrl = `${origin}/sv/integritetspolicy`;

  const members = await prisma.user.findMany({
    where: { accountStatus: "ACTIVE" },
    select: { email: true },
  });

  // Sequential, not parallel - a batch send hitting Resend's API all at
  // once risks rate-limiting. Fine at current scale; if the member base
  // grows large, this should move to a proper email queue instead.
  let sent = 0;
  for (const member of members) {
    try {
      await sendPolicyUpdateEmail(member.email, message, termsUrl, privacyUrl);
      sent++;
    } catch (err) {
      console.error(`Kunde inte skicka till ${member.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: members.length });
}
