import { LegalPage } from "@/components/LegalPage";
import { Link } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  const homeHref = userId ? "/dashboard" : "/";

  if (locale === "en") {
    return (
      <LegalPage title="Cookies" updated="September 5, 2026" homeHref={homeHref}>
        <section>
          <h2>Necessary cookies</h2>
          <p>These are always active - the site doesn&apos;t work without them:</p>
          <ul>
            <li>
              <strong>velvetine_session</strong> - keeps you logged in. Deleted
              when you log out, or expires automatically after 30 days.
              Contains no personal data itself, just a signed reference to
              your session.
            </li>
            <li>
              <strong>velvetine_cookie_consent</strong> - remembers that you&apos;ve
              seen this notice, so it doesn&apos;t show again. Expires after 1 year.
            </li>
            <li>
              <strong>velvetine_analytics_consent</strong> - remembers your
              choice about the optional cookie below. Expires after 1 year.
            </li>
            <li>
              <strong>NEXT_LOCALE</strong> - remembers whether you chose
              Swedish or English, so you land on the right one next time.
              Set automatically by the language switcher. Expires after 1
              year.
            </li>
          </ul>
        </section>

        <section>
          <h2>Optional cookie</h2>
          <p>
            <strong>velvetine_visitor_id</strong> - a random ID used to count
            unique visits (see our{" "}
            <Link href="/integritetspolicy" className="text-gold hover:text-gold-bright">
              Privacy Policy
            </Link>
            , section 6). Only set if you turn on &ldquo;Analytics&rdquo; under
            &ldquo;Manage&rdquo; in the cookie notice - off by default, and
            removed immediately if you turn it back off. Expires after 1 year
            while active.
          </p>
        </section>

        <section>
          <h2>What we don&apos;t use</h2>
          <p>No advertising or tracking cookies, and no third-party analytics.</p>
        </section>

        <section>
          <h2>If we ever add more optional cookies</h2>
          <p>
            We&apos;ll update this page and ask for your consent before
            setting anything new - not after.
          </p>
        </section>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Cookies" updated="5 september 2026" homeHref={homeHref}>
      <section>
        <h2>Nödvändiga cookies</h2>
        <p>De här är alltid aktiva - sidan fungerar inte utan dem:</p>
        <ul>
          <li>
            <strong>velvetine_session</strong> - håller dig inloggad. Tas bort
            när du loggar ut, eller går ut automatiskt efter 30 dagar.
            Innehåller ingen personuppgift i sig själv, bara en signerad
            referens till din session.
          </li>
          <li>
            <strong>velvetine_cookie_consent</strong> - kommer ihåg att du sett
            den här rutan, så den inte visas igen. Går ut efter 1 år.
          </li>
          <li>
            <strong>velvetine_analytics_consent</strong> - kommer ihåg ditt val
            om den valfria cookien nedan. Går ut efter 1 år.
          </li>
          <li>
            <strong>NEXT_LOCALE</strong> - kommer ihåg om du valt svenska
            eller engelska, så du hamnar rätt nästa gång. Sätts automatiskt
            av språkväljaren. Går ut efter 1 år.
          </li>
        </ul>
      </section>

      <section>
        <h2>Valfri cookie</h2>
        <p>
          <strong>velvetine_visitor_id</strong> - en slumpad kod som räknar
          unika besök (se vår{" "}
          <Link href="/integritetspolicy" className="text-gold hover:text-gold-bright">
            integritetspolicy
          </Link>
          , punkt 6). Sätts bara om du slår på &ldquo;Analys&rdquo; under
          &ldquo;Hantera&rdquo; i cookie-rutan - avstängd som standard, och
          tas bort direkt om du stänger av den igen. Går ut efter 1 år medan
          den är aktiv.
        </p>
      </section>

      <section>
        <h2>Vad vi inte använder</h2>
        <p>Inga annons- eller spårningscookies, och ingen tredjeparts analys.</p>
      </section>

      <section>
        <h2>Om vi någon gång lägger till fler valfria cookies</h2>
        <p>
          Vi uppdaterar den här sidan och frågar om ditt samtycke innan
          något nytt sätts - inte efteråt.
        </p>
      </section>
    </LegalPage>
  );
}
