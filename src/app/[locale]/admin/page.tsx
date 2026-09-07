import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { NotifyPolicyUpdateButton } from "@/components/admin/NotifyPolicyUpdateButton";

export default async function AdminOverviewPage() {
  const [totalMembers, byTier, pendingApplications, openReports, suspended, banned, closed] =
    await Promise.all([
      prisma.user.count({ where: { accountStatus: "ACTIVE" } }),
      prisma.tier.findMany({
        orderBy: { level: "asc" },
        select: { name: true, _count: { select: { users: true } } },
      }),
      prisma.tierApplication.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { accountStatus: "SUSPENDED" } }),
      prisma.user.count({ where: { accountStatus: "BANNED" } }),
      prisma.user.count({ where: { accountStatus: "DELETED" } }),
    ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Översikt</h1>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
        <StatCard label="Aktiva medlemmar" value={totalMembers} />
        <StatCard label="Väntande ansökningar" value={pendingApplications} highlight={pendingApplications > 0} />
        <StatCard label="Öppna rapporter" value={openReports} highlight={openReports > 0} />
        <StatCard label="Avstängda konton" value={suspended} />
        <StatCard label="Bannade konton" value={banned} />
        <StatCard label="Avslutade konton" value={closed} />
      </div>

      <h2 className="text-ivory mb-4">Medlemmar per nivå</h2>
      <div className="border border-border rounded-sm bg-surface divide-y divide-border">
        {byTier.map((tier) => (
          <div key={tier.name} className="flex items-center justify-between px-5 py-3">
            <span className="text-ivory-muted">{tier.name}</span>
            <span className="text-ivory">{tier._count.users}</span>
          </div>
        ))}
      </div>

      <h2 className="text-ivory mb-4 mt-10">Villkor</h2>
      <div className="border border-border rounded-sm bg-surface p-5">
        <NotifyPolicyUpdateButton />
      </div>

      <p className="text-sm text-ivory-muted mt-10">
        Besökare, nya medlemmar och avslutade konton över tid finns under{" "}
        <Link href="/admin/stats" className="text-gold hover:text-gold-bright">
          Statistik
        </Link>
        . Betalningsöversikt och AI-granskningar dyker upp här när Stripe och
        OpenAI är kopplade in.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-sm p-5 ${
        highlight ? "border-gold bg-surface-raised" : "border-border bg-surface"
      }`}
    >
      <p className="text-sm text-ivory-muted mb-2">{label}</p>
      <p className={`font-display text-3xl ${highlight ? "text-gold" : "text-ivory"}`}>
        {value}
      </p>
    </div>
  );
}
