import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { calculateAge } from "@/lib/age";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function ProfileEditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect({ href: "/login", locale });
    return;
  }

  const [user, prompts, interests, userInterests, showcaseItems, photos] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { promptAnswers: true, tier: true },
    }),
    prisma.prompt.findMany({ where: { active: true }, orderBy: { category: "asc" } }),
    prisma.interest.findMany({ orderBy: { name: "asc" } }),
    prisma.userInterest.findMany({ where: { userId }, select: { interestId: true } }),
    prisma.showcaseItem.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    prisma.photo.findMany({ where: { userId }, orderBy: { order: "asc" } }),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const equippedFrameItem = user.equippedFrameId
    ? await prisma.storeItem.findUnique({ where: { id: user.equippedFrameId } })
    : null;

  const existingSelfie = await prisma.verificationSelfie.findUnique({ where: { userId } });

  const t = await getTranslations("Profile");

  const answersByPrompt = new Map(user.promptAnswers.map((a) => [a.promptId, a.answer]));
  const selectedInterestIds = new Set(userInterests.map((ui) => ui.interestId));

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto">
        <AppHeader backHref="/dashboard" />

        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        <section className="border border-border rounded-sm p-6 bg-surface mb-8">
          <h2 className="text-ivory mb-1">{t("verificationTitle")}</h2>
          <p className="text-sm text-ivory-muted mb-4">{t("verificationBody")}</p>
          <VerificationUpload initialStatus={existingSelfie?.status ?? "NONE"} />
        </section>

        <ProfileEditForm
          displayName={user.displayName}
          age={calculateAge(user.birthDate)}
          tierName={user.tier ? pickLocalized(locale, user.tier.name, user.tier.nameEn) : null}
          tierLevel={user.tier?.level ?? null}
          verified={user.verified}
          equippedFrame={
            equippedFrameItem
              ? { frameColor: equippedFrameItem.frameColor, frameStyle: equippedFrameItem.frameStyle }
              : null
          }
          initialBio={user.bio ?? ""}
          initialHeightCm={user.heightCm}
          initialOccupation={user.occupation ?? ""}
          initialRelationshipIntent={user.relationshipIntent}
          initialBodyType={user.bodyType}
          initialHairColor={user.hairColor}
          initialLocationCity={user.locationCity ?? ""}
          initialLocationCountry={user.locationCountry}
          initialGender={user.gender}
          initialSeekingGender={user.seekingGender}
          initialPrefHeightMin={user.prefHeightMin}
          initialPrefHeightMax={user.prefHeightMax}
          initialPrefBodyTypes={user.prefBodyTypes}
          initialPrefHairColors={user.prefHairColors}
          prompts={prompts.map((p) => ({
            id: p.id,
            question: pickLocalized(locale, p.question, p.questionEn),
            answer: answersByPrompt.get(p.id) ?? "",
          }))}
          interests={interests.map((i) => ({
            id: i.id,
            name: i.name,
            selected: selectedInterestIds.has(i.id),
          }))}
          initialShowcaseItems={showcaseItems.map((s) => ({
            id: s.id,
            category: s.category,
            name: s.name,
            description: s.description,
            photoUrl: s.photoUrl,
          }))}
          initialPhotos={photos.map((p) => ({
            id: p.id,
            url: p.url,
            isPrimary: p.isPrimary,
          }))}
        />

        <AppFooter />
      </div>
    </div>
  );
}
