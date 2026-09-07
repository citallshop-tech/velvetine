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

  if (id === admin.id) {
    return NextResponse.json(
      { error: "Kan inte radera ditt eget konto härifrån." },
      { status: 400 }
    );
  }

  // Same soft-delete pattern as self-service deletion in the dashboard:
  // scrub personal fields, keep the row so matches/messages/reports that
  // reference this id don't break for the other people involved.
  await prisma.user.update({
    where: { id },
    data: {
      accountStatus: "DELETED",
      deletedAt: new Date(),
      email: `deleted-${id}@velvetine.invalid`,
      displayName: "Borttaget konto",
      bio: null,
    },
  });

  return NextResponse.json({ ok: true });
}
