import { prisma } from "@/lib/prisma";
import { VerificationActionButtons } from "@/components/admin/VerificationActionButtons";

export default async function AdminVerificationsPage() {
  const [pending, resolved] = await Promise.all([
    prisma.verificationSelfie.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { include: { photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" } ] } } } },
    }),
    prisma.verificationSelfie.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 50,
      include: { user: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">
        Verifieringar <span className="text-ivory-muted text-lg">({pending.length})</span>
      </h1>
      <p className="text-ivory-muted mb-8">
        Jämför selfien med personens befintliga profilbilder - godkänn bara om det
        rimligen är samma person. Ingen automatisk ansiktsmatchning, ren manuell bedömning.
      </p>

      <div className="flex flex-col gap-4 mb-12">
        {pending.map((selfie) => (
          <div key={selfie.id} className="border border-border rounded-sm bg-surface p-5">
            <p className="text-ivory mb-1">{selfie.user.displayName}</p>
            <p className="text-sm text-ivory-muted mb-4">{selfie.user.email}</p>

            <div className="flex gap-4 mb-4 flex-wrap">
              <div>
                <p className="text-xs text-ivory-muted mb-1">Verifieringsselfie</p>
                {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URL */}
                <img
                  src={selfie.selfieUrl}
                  alt=""
                  className="w-32 h-32 rounded-sm object-cover border border-gold"
                />
              </div>
              {selfie.user.photos.slice(0, 3).map((photo) => (
                <div key={photo.id}>
                  <p className="text-xs text-ivory-muted mb-1">Profilbild</p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URL */}
                  <img
                    src={photo.url}
                    alt=""
                    className="w-32 h-32 rounded-sm object-cover border border-border"
                  />
                </div>
              ))}
              {selfie.user.photos.length === 0 && (
                <p className="text-sm text-ivory-muted self-center">
                  Personen har inga profilbilder att jämföra med.
                </p>
              )}
            </div>

            <VerificationActionButtons selfieId={selfie.id} />
          </div>
        ))}

        {pending.length === 0 && (
          <div className="border border-border rounded-sm bg-surface p-8 text-center text-ivory-muted">
            Inga väntande verifieringar just nu.
          </div>
        )}
      </div>

      <h2 className="text-ivory text-lg mb-4">Historik</h2>
      <div className="border border-border rounded-sm bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ivory-muted">
              <th className="px-5 py-3 font-normal">Namn</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Avgjord</th>
            </tr>
          </thead>
          <tbody>
            {resolved.map((selfie) => (
              <tr key={selfie.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-ivory">{selfie.user.displayName}</td>
                <td className="px-5 py-3">
                  {selfie.status === "VERIFIED" ? (
                    <span className="text-gold">Verifierad</span>
                  ) : (
                    <span className="text-ivory-muted">Nekad</span>
                  )}
                </td>
                <td className="px-5 py-3 text-ivory-muted">
                  {selfie.reviewedAt?.toLocaleString("sv-SE") ?? "—"}
                </td>
              </tr>
            ))}

            {resolved.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ivory-muted">
                  Inga avgjorda verifieringar än.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
