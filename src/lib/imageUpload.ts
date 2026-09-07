import { put, del } from "@vercel/blob";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class UploadError extends Error {}

/**
 * Validates and uploads an image file to Blob storage under the given
 * path prefix. Throws UploadError with a message safe to show the user
 * for anything that fails validation.
 */
export async function uploadImage(file: File, pathPrefix: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new UploadError("Bildlagring är inte konfigurerad ännu.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError("Endast JPEG, PNG eller WEBP-bilder stöds.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Bilden är för stor (max 8MB).");
  }

  const extension = file.type.split("/")[1];
  const path = `${pathPrefix}/${crypto.randomUUID()}.${extension}`;

  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

/**
 * Best-effort delete - if this fails (already gone, network hiccup)
 * we still want the DB row removed, so callers shouldn't let this
 * throw block the rest of a delete operation.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(url);
    }
  } catch (err) {
    console.error("Kunde inte radera bild från lagring:", err);
  }
}
