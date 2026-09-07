import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportBlockMenu } from "@/components/ReportBlockMenu";
import { ChatThread } from "@/components/ChatThread";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { deleteExpiredMessages } from "@/lib/messageRetention";

// Reserverad ("Reserved") and up - grouped with the hard-filters perk on
// the same tier.
const MIN_TIER_LEVEL_FOR_READ_RECEIPTS = 3;

export default async function MatchThreadPage({
  params,
}: {
  params: Promise<{ locale: string; matchId: string }>;
}) {
  const { locale, matchId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect({ href: "/login", locale });
    return;
  }

  await deleteExpiredMessages(matchId);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    redirect({ href: "/matches", locale });
    return;
  }

  const isUserA = match.userAId === userId;
  const otherLastReadAt = isUserA ? match.lastReadByB : match.lastReadByA;

  await prisma.match.update({
    where: { id: matchId },
    data: isUserA ? { lastReadByA: new Date() } : { lastReadByB: new Date() },
  });

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: { select: { level: true } } },
  });
  const hasReadReceipts = (me?.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_READ_RECEIPTS;

  const other = match.userAId === userId ? match.userB : match.userA;
  const h = await getTranslations("Header");

  const serializedMessages = match.messages.map((m) => ({
    id: m.id,
    content: m.content,
    imageUrl: m.imageUrl,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col px-6 pt-10">
      <div className="max-w-md mx-auto w-full">
        <AppHeader
          backHref="/matches"
          backLabel={h("matches")}
          rightNav={
            <>
              <Link
                href={`/u/${other.id}`}
                className="text-ivory hover:text-gold"
              >
                {other.displayName}
              </Link>
              <ReportBlockMenu targetUserId={other.id} />
            </>
          }
        />
      </div>
      <ChatThread
        matchId={match.id}
        currentUserId={userId}
        initialMessages={serializedMessages}
        isActive={match.status === "ACTIVE"}
        hasReadReceipts={hasReadReceipts}
        otherLastReadAt={otherLastReadAt?.toISOString() ?? null}
      />
      <div className="max-w-md mx-auto w-full">
        <AppFooter />
      </div>
    </div>
  );
}
