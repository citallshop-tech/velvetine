import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { isMatchUnread } from "@/lib/unread";

export default async function MatchesPage({
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

  const matches = await prisma.match.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const t = await getTranslations("Matches");
  const h = await getTranslations("Header");

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <AppHeader
          backHref="/dashboard"
          rightNav={
            <Link href="/discover" className="text-sm text-ivory-muted hover:text-gold">
              {h("browse")}
            </Link>
          }
        />
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-3">
        {matches.map((match) => {
          const other = match.userAId === userId ? match.userB : match.userA;
          const lastMessage = match.messages[0];
          const unread = isMatchUnread(match, userId);

          return (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="border border-border rounded-sm bg-surface p-4 flex items-center gap-4 hover:border-gold transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center shrink-0">
                <span className="font-display italic text-gold">
                  {other.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={unread ? "text-ivory font-medium" : "text-ivory"}>
                  {other.displayName}
                </p>
                <p className={`text-sm truncate ${unread ? "text-gold" : "text-ivory-muted"}`}>
                  {lastMessage?.content ?? t("sayHi")}
                </p>
              </div>
              {unread && <span className="w-2.5 h-2.5 rounded-full bg-gold shrink-0" />}
            </Link>
          );
        })}

        {matches.length === 0 && (
          <p className="text-ivory-muted text-center py-12">{t("empty")}</p>
        )}
      </div>
      <div className="max-w-md mx-auto">
        <AppFooter />
      </div>
    </div>
  );
}
