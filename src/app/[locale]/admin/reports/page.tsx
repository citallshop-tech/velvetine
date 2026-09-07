import { prisma } from "@/lib/prisma";
import { ReportActionButtons } from "@/components/admin/ReportActionButtons";

const REASON_LABELS: Record<string, string> = {
  FAKE_PROFILE: "Falsk profil",
  HARASSMENT: "Trakasserier",
  INAPPROPRIATE_CONTENT: "Olämpligt innehåll",
  UNDERAGE_SUSPECTED: "Misstänkt minderårig",
  SCAM: "Bedrägeri",
  OTHER: "Annat",
};

const SEVERITY_STYLE: Record<string, string> = {
  HIGH: "text-gold-bright border-gold-bright",
  MEDIUM: "text-gold border-gold",
  LOW: "text-ivory-muted border-border",
};

const SEVERITY_LABEL: Record<string, string> = {
  HIGH: "Hög allvarlighetsgrad",
  MEDIUM: "Medel allvarlighetsgrad",
  LOW: "Låg allvarlighetsgrad",
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { reporter: true, reportedUser: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">
        Rapporter <span className="text-ivory-muted text-lg">({reports.length})</span>
      </h1>

      <div className="flex flex-col gap-4">
        {reports.map((report) => (
          <div key={report.id} className="border border-border rounded-sm bg-surface p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-ivory">
                  Rapporterad: {report.reportedUser.displayName}
                </p>
                <p className="text-sm text-ivory-muted">
                  {report.reportedUser.email} · {report.reportedUser.warningCount} tidigare varningar
                </p>
              </div>
              <span className="text-gold-bright text-sm">
                {REASON_LABELS[report.reason] ?? report.reason}
              </span>
            </div>
            <p className="text-sm text-ivory-muted mb-2">
              Anmäld av {report.reporter.displayName}
            </p>
            {report.details && (
              <p className="text-sm text-ivory-muted mb-4 border-l-2 border-border pl-3">
                {report.details}
              </p>
            )}
            {report.aiSeverity ? (
              <div className={`text-sm border rounded-sm px-3 py-2 mb-4 ${SEVERITY_STYLE[report.aiSeverity]}`}>
                <span className="font-medium">AI: {SEVERITY_LABEL[report.aiSeverity]}.</span>{" "}
                {report.aiSummary}
              </div>
            ) : (
              <p className="text-xs text-ivory-muted mb-4">
                Ingen AI-granskning (kräver OPENAI_API_KEY).
              </p>
            )}
            <ReportActionButtons reportId={report.id} />
          </div>
        ))}

        {reports.length === 0 && (
          <div className="border border-border rounded-sm bg-surface p-8 text-center text-ivory-muted">
            Inga öppna rapporter just nu.
          </div>
        )}
      </div>
    </div>
  );
}
