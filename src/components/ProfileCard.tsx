"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

interface PromptAnswerDisplay {
  id: string;
  question: string;
  answer: string;
}

interface ShowcaseItemDisplay {
  id: string;
  label: string; // pre-resolved "🚗 Car — Ferrari 458" style string
  description: string | null;
  photoUrl?: string | null;
}

export interface ProfileCardData {
  displayName: string;
  age: number;
  tierName: string | null;
  tierLevel?: number | null;
  equippedFrame?: { frameColor: string; frameStyle: string } | null;
  verified?: boolean;
  bio: string | null;
  heightCm: number | null;
  occupation: string | null;
  bodyType?: string | null;
  hairColor?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  relationshipIntent: string | null;
  promptAnswers: PromptAnswerDisplay[];
  showcaseItems?: ShowcaseItemDisplay[];
  photoUrls?: string[];
  blurred?: boolean;
}

// Matches the exact badge colors seeded per tier (prisma/seed.ts) - the
// frame around your photo uses the same color as your tier badge, so the
// two visibly belong together rather than being two unrelated systems.
const TIER_FRAME_COLORS: Record<number, string> = {
  1: "#8a7355",
  2: "#a08048",
  3: "#b8923f",
  4: "#c9a24a",
  5: "#d9b667",
};

// A visible symbol badge in the corner of the photo - shown to everyone,
// not just higher-tier viewers, since the whole point is being seen as
// a status signal. Plain unicode glyphs rather than colorful emoji, to
// match the app's understated gold/serif look rather than looking gaudy.
const TIER_SYMBOLS: Record<number, string> = {
  1: "•",
  2: "✦",
  3: "✦✦",
  4: "♛",
  5: "💎",
};

export function ProfileCard({ data }: { data: ProfileCardData }) {
  const t = useTranslations("Discover");
  const {
    displayName,
    age,
    tierName,
    tierLevel,
    equippedFrame,
    verified,
    bio,
    heightCm,
    occupation,
    bodyType,
    hairColor,
    locationCity,
    locationCountry,
    relationshipIntent,
    promptAnswers,
    showcaseItems = [],
    photoUrls = [],
    blurred = false,
  } = data;

  // An equipped store item overrides the default tier-based frame
  // entirely - a purchased frame is meant to be a bigger flex than the
  // passive one everyone gets just for their tier.
  const tierFrameColor = tierLevel ? TIER_FRAME_COLORS[tierLevel] : null;
  const tierFrameWidth = tierLevel ? Math.min(2 + tierLevel, 6) : 0;

  const frameColor = equippedFrame?.frameColor ?? tierFrameColor;
  const frameWidth = equippedFrame
    ? equippedFrame.frameStyle === "double-glow"
      ? 6
      : 4
    : tierFrameWidth;
  const glowStrength = equippedFrame
    ? equippedFrame.frameStyle === "double-glow"
      ? 24
      : equippedFrame.frameStyle === "glow"
        ? 14
        : 0
    : tierLevel && tierLevel >= 4
      ? tierLevel === 5
        ? 20
        : 12
      : 0;

  const frameShadow = frameColor
    ? [
        `inset 0 0 0 ${frameWidth}px ${frameColor}`,
        equippedFrame?.frameStyle === "double-glow"
          ? `inset 0 0 0 ${frameWidth + 3}px ${frameColor}33`
          : null,
        glowStrength > 0 ? `0 0 ${glowStrength}px ${frameColor}66` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const [photoIndex, setPhotoIndex] = useState(0);
  const currentPhoto = photoUrls[Math.min(photoIndex, photoUrls.length - 1)];

  const [lightbox, setLightbox] = useState<{ url: string; caption: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length);
  }

  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % photoUrls.length);
  }

  return (
    <>
      <div className="border border-border rounded-sm bg-surface overflow-hidden">
      <div
        className="relative w-full aspect-square bg-surface-raised flex items-center justify-center"
        style={frameShadow ? { boxShadow: frameShadow } : undefined}
      >
        {tierLevel && TIER_SYMBOLS[tierLevel] && (
          <div
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-ink/70 flex items-center justify-center text-lg"
            style={{ color: frameColor ?? undefined }}
            title={tierName ?? undefined}
          >
            {TIER_SYMBOLS[tierLevel]}
          </div>
        )}

        {currentPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets
          <img
            src={currentPhoto}
            alt={displayName}
            onClick={(e) => {
              if (blurred) return;
              e.stopPropagation();
              setLightbox({ url: currentPhoto, caption: displayName });
            }}
            className={`w-full h-full object-cover ${blurred ? "blur-lg scale-110" : "cursor-zoom-in"}`}
          />
        ) : (
          <span className={`font-display italic text-6xl text-gold ${blurred ? "blur-md" : ""}`}>
            {displayName ? displayName.charAt(0).toUpperCase() : "?"}
          </span>
        )}

        {blurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/40">
            <span className="text-3xl">🔒</span>
            <span className="text-xs text-ivory text-center px-4">{t("blurredNotice")}</span>
          </div>
        )}

        {!blurred && photoUrls.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/60 text-ivory flex items-center justify-center hover:bg-ink/80"
            >
              ‹
            </button>
            <button
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/60 text-ivory flex items-center justify-center hover:bg-ink/80"
            >
              ›
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {photoUrls.map((url, i) => (
                <span
                  key={url}
                  className={`w-1.5 h-1.5 rounded-full ${i === photoIndex ? "bg-gold" : "bg-ivory/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-ivory text-xl">
            {displayName || "—"}
            {age ? `, ${age}` : ""}
            {verified && (
              <span className="text-gold ml-1.5 text-base" title="Verifierad">
                ✓
              </span>
            )}
          </h2>
          {tierName && <span className="text-gold text-sm">{tierName}</span>}
        </div>

        {!blurred && (locationCity || locationCountry) && (
          <p className="text-sm text-ivory-muted mb-2">
            {[locationCity, locationCountry].filter(Boolean).join(", ")}
          </p>
        )}

        {!blurred && bio && <p className="text-ivory-muted text-sm mb-4">{bio}</p>}

        {!blurred && (occupation || heightCm || bodyType || hairColor || relationshipIntent) && (
          <p className="text-xs text-ivory-muted mb-4">
            {[occupation, heightCm ? `${heightCm} cm` : null, bodyType, hairColor, relationshipIntent]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {!blurred &&
          promptAnswers
            .filter((pa) => pa.answer)
            .map((pa) => (
              <div key={pa.id} className="mb-3">
                <p className="text-xs text-ivory-muted">{pa.question}</p>
                <p className="text-sm text-ivory">{pa.answer}</p>
              </div>
            ))}

        {!blurred && showcaseItems.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border">
            {showcaseItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.photoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox({ url: item.photoUrl!, caption: item.label });
                    }}
                    className="shrink-0"
                    aria-label={item.label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets */}
                    <img
                      src={item.photoUrl}
                      alt=""
                      className="w-16 h-16 rounded-sm object-cover border border-border hover:border-gold transition-colors"
                    />
                  </button>
                )}
                <p className="text-sm text-ivory">
                  {item.label}
                  {item.description && (
                    <span className="text-ivory-muted"> — {item.description}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {mounted &&
      lightbox &&
      createPortal(
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-6 cursor-zoom-out"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface text-ivory flex items-center justify-center hover:bg-surface-raised"
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(90vw,40rem)] h-[min(70vh,40rem)] flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets */}
            <img
              src={lightbox.url}
              alt={lightbox.caption}
              className="max-w-full max-h-full w-full h-full rounded-sm object-contain cursor-default"
            />
          </div>
          <p className="text-ivory text-sm mt-4">{lightbox.caption}</p>
        </div>,
        document.body
      )}
    </>
  );
}
