import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, deleteImage, UploadError } from "@/lib/imageUpload";
import { checkImageSafety } from "@/lib/imageModeration";

const MAX_PHOTOS = 6;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const existingCount = await prisma.photo.count({ where: { userId } });
  if (existingCount >= MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Max ${MAX_PHOTOS} bilder - ta bort en för att lägga till en ny.` },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil hittades." }, { status: 400 });
  }

  let url: string;
  try {
    url = await uploadImage(file, `profile-photos/${userId}`);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Fotouppladdning misslyckades:", err);
    return NextResponse.json({ error: "Uppladdningen misslyckades." }, { status: 500 });
  }

  const moderation = await checkImageSafety(url, userId, "profile_photo");
  if (!moderation.safe) {
    await deleteImage(url);
    console.warn(`Bild nekad (${moderation.reason}) för användare ${userId}`);
    return NextResponse.json(
      { error: "Den här bilden kan inte användas - den bryter mot våra villkor." },
      { status: 400 }
    );
  }

  const photo = await prisma.photo.create({
    data: {
      userId,
      url,
      order: existingCount,
      isPrimary: existingCount === 0, // first photo becomes primary automatically
    },
  });

  return NextResponse.json({ ok: true, photo });
}
