import { getAdminUser } from "@/lib/admin";
import { LogoutButton } from "@/components/AccountActions";
import { redirect, Link } from "@/i18n/navigation";

const NAV = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/stats", label: "Statistik" },
  { href: "/admin/users", label: "Medlemmar" },
  { href: "/admin/applications", label: "Ansökningar" },
  { href: "/admin/verifications", label: "Verifieringar" },
  { href: "/admin/safety-flags", label: "Säkerhetsflaggor" },
  { href: "/admin/reports", label: "Rapporter" },
];

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await getAdminUser();
  if (!admin) {
    redirect({ href: "/login", locale });
    return;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-6 py-6">
          <Link href="/" className="font-display italic text-lg text-ivory">
            Velvetine
          </Link>
          <p className="text-xs text-ivory-muted mt-1">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-sm text-sm text-ivory-muted hover:text-ivory hover:bg-surface-raised transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 py-6 border-t border-border">
          <Link
            href="/dashboard"
            className="block text-sm text-ivory-muted hover:text-gold mb-4"
          >
            Visa medlemssidan →
          </Link>
          <p className="text-xs text-ivory-muted mb-3">{admin.displayName}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
