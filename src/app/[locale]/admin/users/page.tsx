import { prisma } from "@/lib/prisma";
import { UserActionButtons } from "@/components/admin/UserActionButtons";
import { TierOverride } from "@/components/admin/TierOverride";
import { reactivateIfExpired } from "@/lib/suspension";

export default async function AdminUsersPage() {
  const [rawUsers, tiers] = await Promise.all([
    prisma.user.findMany({
      where: { accountStatus: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      include: { tier: true },
    }),
    prisma.tier.findMany({ orderBy: { level: "asc" } }),
  ]);

  // Catches anyone whose timed suspension expired since their last login,
  // so the list reflects reality even if they haven't tried to log back
  // in yet themselves.
  const users = await Promise.all(rawUsers.map((u) => reactivateIfExpired(u)));

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">
        Medlemmar <span className="text-ivory-muted text-lg">({users.length})</span>
      </h1>

      <div className="border border-border rounded-sm bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ivory-muted">
              <th className="px-5 py-3 font-normal">Namn</th>
              <th className="px-5 py-3 font-normal">E-post</th>
              <th className="px-5 py-3 font-normal">Nivå</th>
              <th className="px-5 py-3 font-normal">Betalning</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Varningar</th>
              <th className="px-5 py-3 font-normal">Gick med</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-ivory">{user.displayName}</td>
                <td className="px-5 py-3 text-ivory-muted">{user.email}</td>
                <td className="px-5 py-3">
                  <TierOverride
                    userId={user.id}
                    currentTierId={user.tierId}
                    tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
                  />
                </td>
                <td className="px-5 py-3">
                  <SubscriptionBadge status={user.subscriptionStatus} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={user.accountStatus} suspendedUntil={user.suspendedUntil} />
                </td>
                <td className={`px-5 py-3 ${user.warningCount >= 5 ? "text-gold-bright" : "text-ivory-muted"}`}>
                  {user.warningCount}
                </td>
                <td className="px-5 py-3 text-ivory-muted">
                  {user.createdAt.toLocaleDateString("sv-SE")}
                </td>
                <td className="px-5 py-3">
                  <UserActionButtons userId={user.id} status={user.accountStatus} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-ivory-muted">
                  Inga medlemmar än.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubscriptionBadge({ status }: { status: string }) {
  if (status === "ACTIVE") return <span className="text-ivory-muted">Aktiv</span>;
  if (status === "PAST_DUE") return <span className="text-gold-bright">Väntar på betalning</span>;
  if (status === "CANCELED") return <span className="text-ivory-muted">Uppsagd</span>;
  return <span className="text-ivory-muted">—</span>;
}

function StatusBadge({
  status,
  suspendedUntil,
}: {
  status: string;
  suspendedUntil: Date | null;
}) {
  if (status === "ACTIVE") return <span className="text-ivory-muted">Aktiv</span>;
  if (status === "SUSPENDED") {
    return (
      <span className="text-gold-bright">
        Avstängd
        {suspendedUntil && (
          <span className="text-ivory-muted"> (till {suspendedUntil.toLocaleDateString("sv-SE")})</span>
        )}
      </span>
    );
  }
  if (status === "BANNED") return <span className="text-gold-bright">Bannad</span>;
  return <span className="text-ivory-muted">{status}</span>;
}
