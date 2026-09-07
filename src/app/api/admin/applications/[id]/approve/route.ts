import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const { id } = await params;

  const application = await prisma.tierApplication.findUnique({ where: { id } });
  if (!application) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  // Both writes happen together - an approval that assigns the tier only
  // half-way (application marked approved but tier never applied, or vice
  // versa) would leave the applicant in a confusing state.
  await prisma.$transaction([
    prisma.tierApplication.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: admin.id },
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: { tierId: application.tierId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
