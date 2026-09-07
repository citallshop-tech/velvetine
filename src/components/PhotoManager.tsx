"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

export interface PhotoData {
  id: string;
  url: string;
  isPrimary: boolean;
}

const MAX_PHOTOS = 6;

export function PhotoManager({
  photos,
  onPhotosChange,
}: {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
}) {
  const t = useTranslations("Profile");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/photos", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok) {
      setError(data.error ?? "Något gick fel.");
      return;
    }

    onPhotosChange([...photos, data.photo]);
  }

  async function removePhoto(id: string) {
    const wasPrimary = photos.find((p) => p.id === id)?.isPrimary;
    await fetch(`/api/profile/photos/${id}`, { method: "DELETE" });

    const remaining = photos.filter((p) => p.id !== id);
    if (wasPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }
    onPhotosChange(remaining);
  }

  async function setPrimary(id: string) {
    await fetch(`/api/profile/photos/${id}/primary`, { method: "PATCH" });
    onPhotosChange(photos.map((p) => ({ ...p, isPrimary: p.id === id })));
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-sm overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets */}
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {photo.isPrimary && (
                <span className="absolute top-1 left-1 text-xs bg-gold text-ink px-1.5 py-0.5 rounded-sm">
                  {t("primaryLabel")}
                </span>
              )}
              <div className="absolute bottom-1 inset-x-1 flex justify-between gap-1">
                {!photo.isPrimary && (
                  <button
                    onClick={() => setPrimary(photo.id)}
                    className="text-xs bg-surface/90 text-ivory px-1.5 py-0.5 rounded-sm hover:text-gold"
                  >
                    {t("makePrimary")}
                  </button>
                )}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="text-xs bg-surface/90 text-ivory px-1.5 py-0.5 rounded-sm hover:text-gold-bright ml-auto"
                >
                  {t("removePhoto")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length < MAX_PHOTOS ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm text-ivory-muted file:mr-3 file:px-3 file:py-2 file:rounded-sm file:border file:border-gold file:bg-transparent file:text-ivory file:text-sm hover:file:bg-surface-raised"
          />
          {uploading && <p className="text-xs text-ivory-muted mt-1">{t("uploadingPhoto")}</p>}
          {error && <p className="text-xs text-gold-bright mt-1">{error}</p>}
        </div>
      ) : (
        <p className="text-xs text-ivory-muted">{t("maxPhotos")}</p>
      )}
    </div>
  );
}
