import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export function LegalPage({
  title,
  updated,
  homeHref = "/",
  children,
}: {
  title: string;
  updated: string;
  homeHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <AppHeader logoHref={homeHref} backHref={homeHref} />

        <h1 className="font-display text-3xl text-ivory mb-2">{title}</h1>
        <p className="text-sm text-ivory-muted mb-10">Senast uppdaterad: {updated}</p>

        <div className="flex flex-col gap-8 text-ivory-muted leading-relaxed [&_h2]:text-ivory [&_h2]:text-lg [&_h2]:font-display [&_h2]:mb-2 [&_p]:mb-2 [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
