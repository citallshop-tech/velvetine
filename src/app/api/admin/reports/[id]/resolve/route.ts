import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { maybeEraseAfterReportResolved } from "@/lib/accountDeletion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action: "suspend" | "ban" | "dismiss" =
    body.action === "suspend" || body.action === "ban" ? body.action : "dismiss";

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  const reportStatus = action === "dismiss" ? "DISMISSED" : "ACTIONED";
  await prisma.report.update({
    where: { id },
    data: { status: reportStatus, resolvedAt: new Date() },
  });

  // TILLAGD 2026-09-27 (se claude/velvetine-status.md, src/lib/accountDeletion.ts)
  // - om den rapporterade personen redan bett om att få sitt konto
  // raderat, men den riktiga raderingen av bilder/profilfrågor/intressen/
  // skrytprylar/verifieringsselfie sköts upp EFTERSOM den här rapporten
  // var olöst, färdigställ raderingen nu (bara om inga andra olösta
  // rapporter/säkerhetsflaggor finns kvar mot personen). No-op för alla
  // andra rapporter (den absoluta majoriteten) - bara en extra koll.
  await maybeEraseAfterReportResolved(report.reportedUserId);

  if (action === "suspend" || action === "ban") {
    // A validated report adds a warning regardless of which action the
    // admin picked for THIS incident - the strike system (5 = provisional
    // block, 10 = permanent) escalates on top of that admin choice, it
    // never downgrades it.
    const updated = await prisma.user.update({
      where: { id: report.reportedUserId },
      data: { warningCount: { increment: 1 } },
      select: { warningCount: true },
    });

    let newStatus: "SUSPENDED" | "BANNED" = action === "ban" ? "BANNED" : "SUSPENDED";
    if (updated.warningCount >= 10) {
      newStatus = "BANNED";
    }

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + 7);

    await prisma.user.update({
      where: { id: report.reportedUserId },
      data: {
        accountStatus: newStatus,
        // Only meaningful for SUSPENDED - harmless to set on a BANNED
        // account too since reactivateIfExpired() only ever looks at it
        // when accountStatus is SUSPENDED.
        suspendedUntil: newStatus === "SUSPENDED" ? suspendedUntil : null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
