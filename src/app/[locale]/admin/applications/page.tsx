import { prisma } from "@/lib/prisma";
import { ApplicationActionButtons } from "@/components/admin/ApplicationActionButtons";

export default async function AdminApplicationsPage() {
  const [pending, resolved] = await Promise.all([
    prisma.tierApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: true, tier: true },
    }),
    prisma.tierApplication.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 50,
      include: { user: true, tier: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">
        Ansökningar{" "}
        <span className="text-ivory-muted text-lg">({pending.length})</span>
      </h1>
      <p className="text-ivory-muted mb-8">
        Väntar på godkännande för en nivå som kräver ansökan, inte bara betalning.
        Ansökningar godkänns numera direkt automatiskt (om inte kontot är avstängt) -
        den här kön ska normalt vara tom. Historik över redan avgjorda ansökningar
        finns längre ner.
      </p>

      <div className="flex flex-col gap-4 mb-12">
        {pending.map((app) => (
          <div key={app.id} className="border border-border rounded-sm bg-surface p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-ivory">{app.user.displayName}</p>
                <p className="text-sm text-ivory-muted">{app.user.email}</p>
              </div>
              <span className="text-gold text-sm">{app.tier.name}</span>
            </div>
            {app.note && (
              <p className="text-sm text-ivory-muted mb-4 border-l-2 border-border pl-3">
                {app.note}
              </p>
            )}
            <ApplicationActionButtons applicationId={app.id} />
          </div>
        ))}

        {pending.length === 0 && (
          <div className="border border-border rounded-sm bg-surface p-8 text-center text-ivory-muted">
            Inga väntande ansökningar just nu.
          </div>
        )}
      </div>

      <h2 className="text-ivory text-lg mb-4">Historik</h2>
      <div className="border border-border rounded-sm bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ivory-muted">
              <th className="px-5 py-3 font-normal">Namn</th>
              <th className="px-5 py-3 font-normal">Nivå</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Avgjord</th>
              <th className="px-5 py-3 font-normal">Av</th>
            </tr>
          </thead>
          <tbody>
            {resolved.map((app) => (
              <tr key={app.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-ivory">{app.user.displayName}</td>
                <td className="px-5 py-3 text-gold">{app.tier.name}</td>
                <td className="px-5 py-3">
                  {app.status === "APPROVED" ? (
                    <span className="text-gold">Godkänd</span>
                  ) : (
                    <span className="text-ivory-muted">Nekad</span>
                  )}
                </td>
                <td className="px-5 py-3 text-ivory-muted">
                  {app.reviewedAt?.toLocaleString("sv-SE") ?? "—"}
                </td>
                <td className="px-5 py-3 text-ivory-muted">
                  {app.reviewedBy === "auto" ? "Automatiskt" : app.reviewedBy ?? "—"}
                </td>
              </tr>
            ))}

            {resolved.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ivory-muted">
                  Inga avgjorda ansökningar än.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
