import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const VALID_CATEGORIES = ["CAR", "BOAT", "PLANE", "PROPERTY", "PET", "OTHER"];
const MAX_ITEMS = 6;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const category = VALID_CATEGORIES.includes(body.category) ? body.category : null;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 200) || null : null;

  if (!category || !name) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const count = await prisma.showcaseItem.count({ where: { userId } });
  if (count >= MAX_ITEMS) {
    return NextResponse.json(
      { error: `Max ${MAX_ITEMS} saker - ta bort en för att lägga till en ny.` },
      { status: 400 }
    );
  }

  const item = await prisma.showcaseItem.create({
    data: { userId, category, name, description, order: count },
  });

  return NextResponse.json({ ok: true, item });
}
