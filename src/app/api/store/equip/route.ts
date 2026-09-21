import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// TILLAGD 2026-09-21 - PROFILE_BACKGROUND är "utrustningsbar" precis som
// FRAME/CHAT_THEME (en ägs, en är aktiv i taget). DIGITAL_GIFT är INTE med
// här - den utrustas aldrig, den bara ägs och skickas i chatten (se
// src/app/api/matches/[matchId]/messages/route.ts).
const CATEGORIES = ["FRAME", "CHAT_THEME", "PROFILE_BACKGROUND"] as const;
type Category = (typeof CATEGORIES)[number];

const FIELD_BY_CATEGORY: Record<
  Category,
  "equippedFrameId" | "equippedChatThemeId" | "equippedBackgroundId"
> = {
  FRAME: "equippedFrameId",
  CHAT_THEME: "equippedChatThemeId",
  PROFILE_BACKGROUND: "equippedBackgroundId",
};

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const storeItemId = typeof body?.storeItemId === "string" ? body.storeItemId : null;
  const category = CATEGORIES.includes(body?.category) ? (body.category as Category) : null;

  if (!category) {
    return NextResponse.json({ error: "Ogiltig kategori." }, { status: 400 });
  }
  const field = FIELD_BY_CATEGORY[category];

  // Unequip - allowed regardless of ownership, always reverts to the
  // default (tier-based frame, or no chat theme).
  if (!storeItemId) {
    await prisma.user.update({ where: { id: userId }, data: { [field]: null } });
    return NextResponse.json({ ok: true });
  }

  const [owned, item] = await Promise.all([
    prisma.userStoreItem.findUnique({ where: { userId_storeItemId: { userId, storeItemId } } }),
    prisma.storeItem.findUnique({ where: { id: storeItemId } }),
  ]);
  if (!owned) {
    return NextResponse.json({ error: "Du äger inte den här." }, { status: 403 });
  }
  if (!item || item.category !== category) {
    return NextResponse.json({ error: "Ogiltig vara för den här kategorin." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { [field]: storeItemId } });
  return NextResponse.json({ ok: true });
}
