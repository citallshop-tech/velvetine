"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileCard } from "@/components/ProfileCard";
import { PhotoManager, type PhotoData } from "@/components/PhotoManager";
import { ShowcaseManager, type ShowcaseItemData, CATEGORIES, CATEGORY_LABEL_KEYS } from "@/components/ShowcaseManager";

interface PromptItem {
  id: string;
  question: string;
  answer: string;
}

interface InterestItem {
  id: string;
  name: string;
  selected: boolean;
}

const GENDERS = ["WOMAN", "MAN", "NONBINARY", "OTHER"] as const;
const GENDER_LABEL_KEYS: Record<(typeof GENDERS)[number], string> = {
  WOMAN: "genderWoman",
  MAN: "genderMan",
  NONBINARY: "genderNonbinary",
  OTHER: "genderOther",
};

const INTENTS = ["SERIOUS", "CASUAL", "FRIENDSHIP", "NOT_SURE"] as const;
const INTENT_LABEL_KEYS: Record<(typeof INTENTS)[number], string> = {
  SERIOUS: "intentSerious",
  CASUAL: "intentCasual",
  FRIENDSHIP: "intentFriendship",
  NOT_SURE: "intentNotSure",
};

const BODY_TYPES = ["SLIM", "ATHLETIC", "AVERAGE", "CURVY", "MUSCULAR", "PLUS_SIZE"] as const;
const BODY_TYPE_LABEL_KEYS: Record<(typeof BODY_TYPES)[number], string> = {
  SLIM: "bodyTypeSlim",
  ATHLETIC: "bodyTypeAthletic",
  AVERAGE: "bodyTypeAverage",
  CURVY: "bodyTypeCurvy",
  MUSCULAR: "bodyTypeMuscular",
  PLUS_SIZE: "bodyTypePlusSize",
};

const HAIR_COLORS = ["BLONDE", "BROWN", "BLACK", "RED", "GRAY", "OTHER"] as const;
const HAIR_COLOR_LABEL_KEYS: Record<(typeof HAIR_COLORS)[number], string> = {
  BLONDE: "hairColorBlonde",
  BROWN: "hairColorBrown",
  BLACK: "hairColorBlack",
  RED: "hairColorRed",
  GRAY: "hairColorGray",
  OTHER: "hairColorOther",
};

const COUNTRY_CODES = [
  "SE", "NO", "DK", "FI", "IS", "GB", "DE", "FR", "ES", "IT",
  "NL", "BE", "AT", "CH", "IE", "PT", "PL", "US", "CA", "AU", "OTHER",
] as const;
const COUNTRY_LABEL_KEYS: Record<(typeof COUNTRY_CODES)[number], string> = {
  SE: "countrySE", NO: "countryNO", DK: "countryDK", FI: "countryFI", IS: "countryIS",
  GB: "countryGB", DE: "countryDE", FR: "countryFR", ES: "countryES", IT: "countryIT",
  NL: "countryNL", BE: "countryBE", AT: "countryAT", CH: "countryCH", IE: "countryIE",
  PT: "countryPT", PL: "countryPL", US: "countryUS", CA: "countryCA", AU: "countryAU",
  OTHER: "countryOTHER",
};

export function ProfileEditForm({
  displayName,
  age,
  tierName,
  tierLevel,
  equippedFrame,
  verified,
  initialBio,
  initialHeightCm,
  initialOccupation,
  initialRelationshipIntent,
  initialBodyType,
  initialHairColor,
  initialLocationCity,
  initialLocationCountry,
  initialGender,
  initialSeekingGender,
  initialPrefHeightMin,
  initialPrefHeightMax,
  initialPrefBodyTypes,
  initialPrefHairColors,
  prompts,
  interests,
  initialShowcaseItems,
  initialPhotos,
}: {
  displayName: string;
  age: number;
  tierName: string | null;
  tierLevel: number | null;
  equippedFrame: { frameColor: string; frameStyle: string } | null;
  verified: boolean;
  initialBio: string;
  initialHeightCm: number | null;
  initialOccupation: string;
  initialRelationshipIntent: string | null;
  initialBodyType: string | null;
  initialHairColor: string | null;
  initialLocationCity: string;
  initialLocationCountry: string | null;
  initialGender: string;
  initialSeekingGender: string[];
  initialPrefHeightMin: number | null;
  initialPrefHeightMax: number | null;
  initialPrefBodyTypes: string[];
  initialPrefHairColors: string[];
  prompts: PromptItem[];
  interests: InterestItem[];
  initialShowcaseItems: ShowcaseItemData[];
  initialPhotos: PhotoData[];
}) {
  const t = useTranslations("Profile");
  const sc = useTranslations("Showcase");
  const rt = useTranslations("Register");

  const [bio, setBio] = useState(initialBio);
  const [heightCm, setHeightCm] = useState(initialHeightCm?.toString() ?? "");
  const [occupation, setOccupation] = useState(initialOccupation);
  const [relationshipIntent, setRelationshipIntent] = useState(initialRelationshipIntent ?? "");
  const [bodyType, setBodyType] = useState(initialBodyType ?? "");
  const [hairColor, setHairColor] = useState(initialHairColor ?? "");
  const [locationCity, setLocationCity] = useState(initialLocationCity);
  const [locationCountry, setLocationCountry] = useState(initialLocationCountry ?? "");
  const [gender, setGender] = useState(initialGender);
  const [seekingGender, setSeekingGender] = useState<string[]>(initialSeekingGender);
  const [genderStatus, setGenderStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [aboutStatus, setAboutStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [prefHeightMin, setPrefHeightMin] = useState(initialPrefHeightMin?.toString() ?? "");
  const [prefHeightMax, setPrefHeightMax] = useState(initialPrefHeightMax?.toString() ?? "");
  const [prefBodyTypes, setPrefBodyTypes] = useState<string[]>(initialPrefBodyTypes ?? []);
  const [prefHairColors, setPrefHairColors] = useState<string[]>(initialPrefHairColors ?? []);
  const [prefStatus, setPrefStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [promptValues, setPromptValues] = useState(
    Object.fromEntries(prompts.map((p) => [p.id, p.answer]))
  );
  const [promptStatus, setPromptStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});

  const [interestState, setInterestState] = useState(
    Object.fromEntries(interests.map((i) => [i.id, i.selected]))
  );

  const [showcaseItems, setShowcaseItems] = useState(initialShowcaseItems);
  const [photos, setPhotos] = useState(initialPhotos);

  async function saveGender() {
    setGenderStatus("saving");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender, seekingGender }),
    });
    setGenderStatus("saved");
    setTimeout(() => setGenderStatus("idle"), 2000);
  }

  function toggleSeekingGender(value: string) {
    setSeekingGender((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function saveAbout() {
    setAboutStatus("saving");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        heightCm: heightCm ? Number(heightCm) : null,
        occupation,
        relationshipIntent: relationshipIntent || null,
        bodyType: bodyType || null,
        hairColor: hairColor || null,
        locationCity,
        locationCountry: locationCountry || null,
      }),
    });
    setAboutStatus("saved");
    setTimeout(() => setAboutStatus("idle"), 2000);
  }

  async function savePreferences() {
    setPrefStatus("saving");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prefHeightMin: prefHeightMin ? Number(prefHeightMin) : null,
        prefHeightMax: prefHeightMax ? Number(prefHeightMax) : null,
        prefBodyTypes,
        prefHairColors,
      }),
    });
    setPrefStatus("saved");
    setTimeout(() => setPrefStatus("idle"), 2000);
  }

  function togglePrefBodyType(value: string) {
    setPrefBodyTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function togglePrefHairColor(value: string) {
    setPrefHairColors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function savePrompt(promptId: string) {
    setPromptStatus((s) => ({ ...s, [promptId]: "saving" }));
    await fetch("/api/profile/prompt-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, answer: promptValues[promptId] ?? "" }),
    });
    setPromptStatus((s) => ({ ...s, [promptId]: "saved" }));
    setTimeout(() => setPromptStatus((s) => ({ ...s, [promptId]: "idle" })), 2000);
  }

  async function toggleInterest(interestId: string) {
    const nextSelected = !interestState[interestId];
    setInterestState((s) => ({ ...s, [interestId]: nextSelected }));
    await fetch("/api/profile/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interestId, selected: nextSelected }),
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-ivory mb-3">{t("previewTitle")}</h2>
        <ProfileCard
          data={{
            displayName,
            age,
            tierName,
            tierLevel,
            equippedFrame,
            verified,
            bio: bio || null,
            heightCm: heightCm ? Number(heightCm) : null,
            occupation: occupation || null,
            bodyType: bodyType ? t(BODY_TYPE_LABEL_KEYS[bodyType as (typeof BODY_TYPES)[number]]) : null,
            hairColor: hairColor ? t(HAIR_COLOR_LABEL_KEYS[hairColor as (typeof HAIR_COLORS)[number]]) : null,
            locationCity: locationCity || null,
            locationCountry: locationCountry
              ? t(COUNTRY_LABEL_KEYS[locationCountry as (typeof COUNTRY_CODES)[number]])
              : null,
            relationshipIntent: relationshipIntent
              ? t(INTENT_LABEL_KEYS[relationshipIntent as (typeof INTENTS)[number]])
              : null,
            photoUrls: [...photos].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map((p) => p.url),
            promptAnswers: prompts.map((p) => ({
              id: p.id,
              question: p.question,
              answer: promptValues[p.id] ?? "",
            })),
            showcaseItems: showcaseItems.map((item) => ({
              id: item.id,
              label: `${sc(CATEGORY_LABEL_KEYS[item.category as (typeof CATEGORIES)[number]])} — ${item.name}`,
              description: item.description,
              photoUrl: item.photoUrl,
            })),
          }}
        />
      </section>

      <section>
        <h2 className="text-ivory mb-1">{rt("genderLabel")} / {rt("seekingLabel")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{rt("genderLabel")}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {rt(GENDER_LABEL_KEYS[g])}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-sm text-ivory-muted block mb-1">{rt("seekingLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => {
                const active = seekingGender.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => toggleSeekingGender(g)}
                    className={`px-3 py-1.5 rounded-sm text-sm border transition-colors ${
                      active
                        ? "border-gold bg-surface-raised text-ivory"
                        : "border-border text-ivory-muted hover:border-gold"
                    }`}
                  >
                    {rt(GENDER_LABEL_KEYS[g])}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={saveGender}
            disabled={genderStatus === "saving" || seekingGender.length === 0}
            className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
          >
            {genderStatus === "saving" ? t("saving") : t("save")}
          </button>
          {genderStatus === "saved" && <span className="text-sm text-gold">{t("saved")}</span>}
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("photosTitle")}</h2>
        <p className="text-sm text-ivory-muted mb-4">{t("photosSubtitle")}</p>
        <PhotoManager photos={photos} onPhotosChange={setPhotos} />
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("bioLabel")}</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t("bioPlaceholder")}
          rows={4}
          maxLength={500}
          className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold mt-2"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("heightLabel")}</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              min={100}
              max={250}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("occupationLabel")}</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder={t("occupationPlaceholder")}
              maxLength={100}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("bodyTypeLabel")}</label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
            >
              <option value="">{t("bodyTypeNone")}</option>
              {BODY_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {t(BODY_TYPE_LABEL_KEYS[bt])}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("hairColorLabel")}</label>
            <select
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
            >
              <option value="">{t("hairColorNone")}</option>
              {HAIR_COLORS.map((hc) => (
                <option key={hc} value={hc}>
                  {t(HAIR_COLOR_LABEL_KEYS[hc])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("locationCityLabel")}</label>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder={t("locationCityPlaceholder")}
              maxLength={100}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-sm text-ivory-muted block mb-1">{t("locationCountryLabel")}</label>
            <select
              value={locationCountry}
              onChange={(e) => setLocationCountry(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
            >
              <option value="">{t("locationCountryNone")}</option>
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(COUNTRY_LABEL_KEYS[code])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-ivory-muted block mb-1">{t("relationshipIntentLabel")}</label>
          <select
            value={relationshipIntent}
            onChange={(e) => setRelationshipIntent(e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory focus:outline-none focus:border-gold"
          >
            <option value="">{t("intentNone")}</option>
            {INTENTS.map((intent) => (
              <option key={intent} value={intent}>
                {t(INTENT_LABEL_KEYS[intent])}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={saveAbout}
            disabled={aboutStatus === "saving"}
            className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
          >
            {aboutStatus === "saving" ? t("saving") : t("save")}
          </button>
          {aboutStatus === "saved" && <span className="text-sm text-gold">{t("saved")}</span>}
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("preferencesTitle")}</h2>
        <p className="text-sm text-ivory-muted mb-1">{t("preferencesSubtitle")}</p>
        <p className="text-xs text-gold mb-4">{t("preferencesPrivateNote")}</p>

        <div>
          <label className="text-sm text-ivory-muted block mb-1">{t("prefHeightLabel")}</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={prefHeightMin}
              onChange={(e) => setPrefHeightMin(e.target.value)}
              placeholder={t("prefHeightMin")}
              min={100}
              max={250}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
            />
            <input
              type="number"
              value={prefHeightMax}
              onChange={(e) => setPrefHeightMax(e.target.value)}
              placeholder={t("prefHeightMax")}
              min={100}
              max={250}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-ivory-muted block mb-2">{t("prefBodyTypeLabel")}</label>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => togglePrefBodyType(bt)}
                className={`px-3 py-1.5 rounded-sm text-sm border transition-colors ${
                  prefBodyTypes.includes(bt)
                    ? "border-gold bg-surface-raised text-ivory"
                    : "border-border text-ivory-muted hover:border-gold"
                }`}
              >
                {t(BODY_TYPE_LABEL_KEYS[bt])}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-ivory-muted block mb-2">{t("prefHairColorLabel")}</label>
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((hc) => (
              <button
                key={hc}
                type="button"
                onClick={() => togglePrefHairColor(hc)}
                className={`px-3 py-1.5 rounded-sm text-sm border transition-colors ${
                  prefHairColors.includes(hc)
                    ? "border-gold bg-surface-raised text-ivory"
                    : "border-border text-ivory-muted hover:border-gold"
                }`}
              >
                {t(HAIR_COLOR_LABEL_KEYS[hc])}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={savePreferences}
            disabled={prefStatus === "saving"}
            className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
          >
            {prefStatus === "saving" ? t("saving") : t("save")}
          </button>
          {prefStatus === "saved" && <span className="text-sm text-gold">{t("saved")}</span>}
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("promptsTitle")}</h2>
        <p className="text-sm text-ivory-muted mb-4">{t("promptsSubtitle")}</p>
        <div className="flex flex-col gap-5">
          {prompts.map((p) => (
            <div key={p.id}>
              <p className="text-sm text-ivory-muted mb-2">{p.question}</p>
              <textarea
                value={promptValues[p.id] ?? ""}
                onChange={(e) =>
                  setPromptValues((v) => ({ ...v, [p.id]: e.target.value }))
                }
                placeholder={t("promptPlaceholder")}
                rows={2}
                maxLength={300}
                className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => savePrompt(p.id)}
                  disabled={promptStatus[p.id] === "saving"}
                  className="text-sm text-gold hover:text-gold-bright disabled:opacity-50"
                >
                  {promptStatus[p.id] === "saving" ? t("saving") : t("save")}
                </button>
                {promptStatus[p.id] === "saved" && (
                  <span className="text-sm text-ivory-muted">{t("saved")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("interestsTitle")}</h2>
        <p className="text-sm text-ivory-muted mb-4">{t("interestsSubtitle")}</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => (
            <button
              key={i.id}
              onClick={() => toggleInterest(i.id)}
              className={`px-3 py-2 rounded-sm text-sm border transition-colors ${
                interestState[i.id]
                  ? "border-gold bg-surface-raised text-ivory"
                  : "border-border text-ivory-muted hover:border-gold"
              }`}
            >
              {i.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-1">{sc("title")}</h2>
        <p className="text-sm text-ivory-muted mb-4">{sc("subtitle")}</p>
        <ShowcaseManager items={showcaseItems} onItemsChange={setShowcaseItems} />
      </section>

      <section>
        <h2 className="text-ivory mb-1">{t("exportTitle")}</h2>
        <p className="text-sm text-ivory-muted mb-4">{t("exportBody")}</p>
        <a
          href="/api/profile/export"
          download
          className="inline-block px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised"
        >
          {t("exportButton")}
        </a>
      </section>
    </div>
  );
}
