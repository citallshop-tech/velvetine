import { prisma } from "@/lib/prisma";
import { VisitorsChart } from "@/components/admin/VisitorsChart";
import { GrowthChart } from "@/components/admin/GrowthChart";

const DAYS = 30;

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

export default async function AdminStatsPage() {
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  // TILLAGD 2026-09-21 - Christoffer ville ha "hur många är på sidan just
  // nu / hur många har varit totalt" på ALLA plattformar (byggdes först på
  // Farvyo, se claude/velvetine-status.md). Velvetine hade redan en egen
  // enkel sidvisnings-logg (PageView, se schema.prisma) inklusive en
  // samtyckesgated besökar-cookie (velvetine_visitor_id/
  // velvetine_analytics_consent, se src/lib/visitorCookie.ts +
  // src/lib/analyticsConsent.ts + PageViewTracker.tsx) - bara "online just
  // nu" och ett RIKTIGT all-time-totalt saknades (de gamla totalViews/
  // totalUnique nedan var av misstag begränsade till samma 30-dagarsfönster
  // som grafen, trots att de stod märkta "totalt").
  const now = new Date();
  const onlineSince = new Date(now.getTime() - 5 * 60 * 1000);
  const last24hSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [pageViews, users, onlineNowViews, last24hViews, allTimeTotalViews, allTimeUniqueViews] =
    await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, visitorHash: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [{ createdAt: { gte: since } }, { deletedAt: { gte: since } }],
        },
        select: { createdAt: true, deletedAt: true },
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: onlineSince } },
        select: { visitorHash: true },
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: last24hSince } },
        select: { visitorHash: true },
      }),
      // Riktigt all-time, obegränsat av DAYS-fönstret ovan.
      prisma.pageView.count(),
      prisma.pageView.findMany({ distinct: ["visitorHash"], select: { visitorHash: true } }),
    ]);

  const onlineNowCount = new Set(onlineNowViews.map((v) => v.visitorHash)).size;
  const last24hCount = new Set(last24hViews.map((v) => v.visitorHash)).size;
  const allTimeUniqueCount = allTimeUniqueViews.length;

  const visitorData: { date: string; besök: number; unika: number }[] = [];
  const growthData: { date: string; nya: number; avslutade: number }[] = [];

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);

    const viewsThatDay = pageViews.filter((v) => sameDay(v.createdAt, day));
    const uniqueThatDay = new Set(viewsThatDay.map((v) => v.visitorHash));

    const signups = users.filter((u) => sameDay(u.createdAt, day)).length;
    const closures = users.filter(
      (u) => u.deletedAt && sameDay(u.deletedAt, day)
    ).length;

    const label = dayLabel(day);
    visitorData.push({ date: label, besök: viewsThatDay.length, unika: uniqueThatDay.size });
    growthData.push({ date: label, nya: signups, avslutade: closures });
  }

  // OMDÖPTA 2026-09-21 - hette tidigare totalViews/totalUnique men var i
  // praktiken bara summan av pageViews-arrayen, som redan är begränsad
  // till DAYS-fönstret ovan (30 dagar) - alltså INTE riktigt "totalt"
  // trots namnet/etiketten som stod i gränssnittet. Riktigt all-time finns
  // nu separat som allTimeTotalViews/allTimeUniqueCount ovan.
  const viewsLast30Days = pageViews.length;
  const uniqueLast30Days = new Set(pageViews.map((v) => v.visitorHash)).size;

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">Statistik</h1>
      <p className="text-ivory-muted mb-10">Senaste {DAYS} dagarna.</p>

      <section className="mb-10">
        <h2 className="text-ivory mb-4">Besökare på sajten (alla, live)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-border rounded-sm bg-surface p-4">
            <p className="text-xs text-ivory-muted">Online just nu (senaste 5 min)</p>
            <p className="text-xl text-gold font-display">{onlineNowCount}</p>
          </div>
          <div className="border border-border rounded-sm bg-surface p-4">
            <p className="text-xs text-ivory-muted">Besökare senaste 24 timmarna</p>
            <p className="text-xl text-ivory font-display">{last24hCount}</p>
          </div>
          <div className="border border-border rounded-sm bg-surface p-4">
            <p className="text-xs text-ivory-muted">Besökare totalt genom tiderna</p>
            <p className="text-xl text-ivory font-display">{allTimeUniqueCount}</p>
          </div>
        </div>
        <p className="text-xs text-ivory-muted mt-2">
          {allTimeTotalViews} sidvisningar totalt genom tiderna. &quot;Online&quot; räknas som en
          unik besökare som synts till (öppnat/bytt sida) de senaste 5 minuterna - uppdateras när
          du laddar om sidan, ingen live-siffra utan omladdning.
        </p>
      </section>

      <section className="mb-12">
        <div className="flex items-baseline gap-6 mb-4">
          <h2 className="text-ivory">Besökare, senaste {DAYS} dagarna</h2>
          <span className="text-sm text-ivory-muted">
            {viewsLast30Days} sidvisningar · {uniqueLast30Days} unika besökare
          </span>
        </div>
        <div className="border border-border rounded-sm bg-surface p-5">
          <VisitorsChart data={visitorData} />
        </div>
      </section>

      <section>
        <h2 className="text-ivory mb-4">Nya medlemmar vs. avslutade konton</h2>
        <div className="border border-border rounded-sm bg-surface p-5">
          <GrowthChart data={growthData} />
        </div>
      </section>

      <p className="text-sm text-ivory-muted mt-10">
        Besöksräknaren använder en anonym besökar-cookie (velvetine_visitor_id) som bara sätts om
        besökaren uttryckligen godkänt Analys-cookies i cookie-panelen (se
        src/lib/analyticsConsent.ts) - tackar besökaren nej sätts ingen cookie och den personen
        räknas inte in här, samma ärliga avvägning som resten av sajtens statistik. Räknar inte
        besök på adminsidorna.
      </p>
    </div>
  );
}
