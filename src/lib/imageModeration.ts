import { prisma } from "@/lib/prisma";

const MODERATION_API_URL = "https://api.openai.com/v1/moderations";
const MODEL = "omni-moderation-latest";

// Public-facing content (profile photos, showcase items) stays
// conservative - swimwear passes, real nudity doesn't, since anyone can
// see this without matching first.
const PUBLIC_SEXUAL_SCORE_THRESHOLD = 0.7;

// Private chat between two people who already matched is their own
// business - consenting adults can send each other what they want
// there. Only the minors check below still applies, unconditionally,
// regardless of context.
const PRIVATE_CHAT_SEXUAL_SCORE_THRESHOLD = 1.01; // effectively never trips on score alone

export type ModerationContext =
  | "profile_photo"
  | "showcase_photo"
  | "verification_selfie"
  | "chat_image";

const PUBLIC_CONTEXTS: ModerationContext[] = ["profile_photo", "showcase_photo", "verification_selfie"];

export interface ImageModerationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Checks an already-uploaded image URL. Returns safe: true if
 * OPENAI_API_KEY isn't configured or the check fails for any technical
 * reason - this is a real safety layer, not a decorative one, but a
 * network hiccup shouldn't be able to silently block every upload
 * either. The absence of a configured key is logged loudly so it's
 * impossible to miss before a real launch.
 *
 * If the image is flagged as suspected CSAM, this does NOT just return
 * safe: false and let the caller log it and move on - it creates a
 * permanent SafetyFlag record and immediately suspends the account,
 * right here, so this critical path can never be accidentally skipped
 * by a caller that forgets to handle it. Actually reporting this
 * externally (NCMEC CyberTipline) is a manual step for whoever operates
 * this platform, once registered as an Electronic Service Provider -
 * this function's job ends at "flagged, recorded, account frozen."
 */
export async function checkImageSafety(
  imageUrl: string,
  userId: string,
  context: ModerationContext
): Promise<ImageModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[SÄKERHETSVARNING] Bildgranskning är inte konfigurerad (OPENAI_API_KEY saknas) - " +
        "bilder accepteras utan filter. Måste lösas innan skarp lansering."
    );
    return { safe: true };
  }

  try {
    const res = await fetch(MODERATION_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: "image_url", image_url: { url: imageUrl } }],
      }),
    });

    if (!res.ok) {
      console.error(`OpenAI moderation API error: ${res.status} ${await res.text()}`);
      return { safe: true }; // fail open on a technical error, not fail closed on everyone
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return { safe: true };

    const minorsFlag = result.categories?.["sexual/minors"] === true;

    if (minorsFlag) {
      // This check runs regardless of context (public or private chat) -
      // it is never relaxed, under any circumstance.
      await Promise.all([
        prisma.safetyFlag.create({
          data: { userId, context, imageUrl },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { accountStatus: "SUSPENDED" },
        }),
      ]);
      return { safe: false, reason: "underage_suspected" };
    }

    const sexualScore = result.category_scores?.["sexual"] ?? 0;
    const threshold = PUBLIC_CONTEXTS.includes(context)
      ? PUBLIC_SEXUAL_SCORE_THRESHOLD
      : PRIVATE_CHAT_SEXUAL_SCORE_THRESHOLD;

    if (result.categories?.["sexual"] === true && PUBLIC_CONTEXTS.includes(context)) {
      return { safe: false, reason: "sexual_content" };
    }
    if (sexualScore >= threshold) {
      return { safe: false, reason: "sexual_content" };
    }

    return { safe: true };
  } catch (err) {
    console.error("Bildgranskning misslyckades:", err);
    return { safe: true };
  }
}
