import { prisma } from "@/lib/prisma";
import { deleteExpiredSafetyFlags } from "@/lib/messageRetention";
import { SafetyFlagActionButton } from "@/components/admin/SafetyFlagActionButton";
import { SafetyFlagImageReveal } from "@/components/admin/SafetyFlagImageReveal";

export default async function AdminSafetyFlagsPage() {
  await deleteExpiredSafetyFlags();

  const flags = await prisma.safetyFlag.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">
        Säkerhetsflaggor <span className="text-ivory-muted text-lg">({flags.length})</span>
      </h1>
      <div className="border border-gold rounded-sm bg-surface-raised p-4 mb-8 text-sm text-ivory-muted">
        <p className="mb-2">
          Varje rad här betyder att vårt automatiska filter misstänkte innehåll som rör
          minderåriga i en uppladdad bild. Kontot har redan stängts av automatiskt - det
          är inget du behöver göra just nu för att stoppa det.
        </p>
        <p className="mb-2">
          Bilden är dold som standard, men går att visa via en bekräftelseknapp om du
          behöver bedöma om flaggningen stämmer - annars vore det omöjligt att skilja en
          felflaggning (t.ex. en person i baddräkt) från något som faktiskt behöver
          rapporteras. Visa bara när du behöver, och stäng igen efteråt.
        </p>
        <p>
          Filtret har omkring 20% falska positiva i forskning på liknande system - en
          flaggning är inte automatiskt ett bevisat fall, men kontot förblir avstängt
          tills ni själva bedömt det, med försiktighet.
        </p>
      </div>

      <div className="border border-border rounded-sm bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ivory-muted">
              <th className="px-5 py-3 font-normal">Konto</th>
              <th className="px-5 py-3 font-normal">Var</th>
              <th className="px-5 py-3 font-normal">När</th>
              <th className="px-5 py-3 font-normal">Bild</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3">
                  <p className="text-ivory">{flag.user.displayName}</p>
                  <p className="text-xs text-ivory-muted">{flag.user.email}</p>
                </td>
                <td className="px-5 py-3 text-ivory-muted">{flag.context}</td>
                <td className="px-5 py-3 text-ivory-muted">
                  {flag.createdAt.toLocaleString("sv-SE")}
                </td>
                <td className="px-5 py-3">
                  <SafetyFlagImageReveal imageUrl={flag.imageUrl} />
                </td>
                <td className="px-5 py-3">
                  {flag.reviewedAt ? (
                    <span className="text-xs text-ivory-muted">
                      Klarmarkerad {flag.reviewedAt.toLocaleDateString("sv-SE")} - raderas om
                      1 år (matchar NCMEC:s egen förväntade sparfrist, inte en gissning)
                    </span>
                  ) : (
                    <SafetyFlagActionButton flagId={flag.id} />
                  )}
                </td>
              </tr>
            ))}

            {flags.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ivory-muted">
                  Inga flaggningar - så ska det se ut.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
