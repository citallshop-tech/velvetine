import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, deleteImage, UploadError } from "@/lib/imageUpload";
import { checkImageSafety } from "@/lib/imageModeration";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.showcaseItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil hittades." }, { status: 400 });
  }

  let url: string;
  try {
    url = await uploadImage(file, `showcase-photos/${userId}`);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Fotouppladdning misslyckades:", err);
    return NextResponse.json({ error: "Uppladdningen misslyckades." }, { status: 500 });
  }

  const moderation = await checkImageSafety(url, userId, "showcase_photo");
  if (!moderation.safe) {
    await deleteImage(url);
    console.warn(`Bild nekad (${moderation.reason}) för användare ${userId}`);
    return NextResponse.json(
      { error: "Den här bilden kan inte användas - den bryter mot våra villkor." },
      { status: 400 }
    );
  }

  const previousUrl = item.photoUrl;

  await prisma.showcaseItem.update({ where: { id }, data: { photoUrl: url } });

  if (previousUrl) {
    await deleteImage(previousUrl);
  }

  return NextResponse.json({ ok: true, photoUrl: url });
}
