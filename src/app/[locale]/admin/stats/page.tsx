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

  const [pageViews, users] = await Promise.all([
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
  ]);

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

  const totalViews = pageViews.length;
  const totalUnique = new Set(pageViews.map((v) => v.visitorHash)).size;

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">Statistik</h1>
      <p className="text-ivory-muted mb-10">Senaste {DAYS} dagarna.</p>

      <section className="mb-12">
        <div className="flex items-baseline gap-6 mb-4">
          <h2 className="text-ivory">Besökare</h2>
          <span className="text-sm text-ivory-muted">
            {totalViews} sidvisningar · {totalUnique} unika besökare totalt
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
        Besöksräknaren är en egen enkel lösning (ingen cookie, ingen sparad
        IP-adress) - ingen samtyckesruta krävs för den. Den räknar inte
        besök på adminsidorna.
      </p>
    </div>
  );
}
