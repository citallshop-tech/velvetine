import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, deleteImage, UploadError } from "@/lib/imageUpload";
import { checkImageSafety } from "@/lib/imageModeration";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil hittades." }, { status: 400 });
  }

  let url: string;
  try {
    url = await uploadImage(file, `verification-selfies/${userId}`);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Uppladdning av verifieringsselfie misslyckades:", err);
    return NextResponse.json({ error: "Uppladdningen misslyckades." }, { status: 500 });
  }

  // Same safety filter as every other photo upload - a selfie is still
  // a photo someone could misuse, moderation applies regardless of purpose.
  const moderation = await checkImageSafety(url, userId, "verification_selfie");
  if (!moderation.safe) {
    await deleteImage(url);
    console.warn(`Verifieringsselfie nekad (${moderation.reason}) för användare ${userId}`);
    return NextResponse.json(
      { error: "Den här bilden kan inte användas - den bryter mot våra villkor." },
      { status: 400 }
    );
  }

  const existing = await prisma.verificationSelfie.findUnique({ where: { userId } });
  if (existing) {
    if (existing.selfieUrl) await deleteImage(existing.selfieUrl).catch(() => {});
  }

  const selfie = await prisma.verificationSelfie.upsert({
    where: { userId },
    create: { userId, selfieUrl: url, status: "PENDING" },
    update: { selfieUrl: url, status: "PENDING", reviewedAt: null },
  });

  return NextResponse.json({ ok: true, status: selfie.status });
}
