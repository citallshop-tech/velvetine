import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, deleteImage, UploadError } from "@/lib/imageUpload";
import { checkImageSafety } from "@/lib/imageModeration";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { matchId } = await params;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }
  if (match.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konversationen är inte längre aktiv." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil hittades." }, { status: 400 });
  }

  let url: string;
  try {
    url = await uploadImage(file, `chat-photos/${matchId}`);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Bilduppladdning i chatt misslyckades:", err);
    return NextResponse.json({ error: "Uppladdningen misslyckades." }, { status: 500 });
  }

  const moderation = await checkImageSafety(url, userId, "chat_image");
  if (!moderation.safe) {
    await deleteImage(url);
    console.warn(`Chattbild nekad (${moderation.reason}) för användare ${userId}`);
    return NextResponse.json(
      { error: "Den här bilden kan inte skickas - den bryter mot våra villkor." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, url });
}
