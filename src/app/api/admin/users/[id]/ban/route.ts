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
      { error: "Kan inte banna ditt eget konto." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { accountStatus: "BANNED" },
  });

  return NextResponse.json({ ok: true });
}
