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
              <strong>NEXT_LOCALE</strong> - remembers which language you
              chose, so you land on the right one next time. Set
              automatically by the language switcher. Expires after 1
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

  if (locale === "de") {
    return (
      <LegalPage title="Cookies" updated="5. September 2026" homeHref={homeHref}>
        <section>
          <h2>Notwendige Cookies</h2>
          <p>Diese sind immer aktiv - die Website funktioniert ohne sie nicht:</p>
          <ul>
            <li>
              <strong>velvetine_session</strong> - hält dich angemeldet. Wird
              beim Abmelden gelöscht oder läuft automatisch nach 30 Tagen
              ab. Enthält selbst keine personenbezogenen Daten, nur eine
              signierte Referenz auf deine Sitzung.
            </li>
            <li>
              <strong>velvetine_cookie_consent</strong> - merkt sich, dass du
              diesen Hinweis gesehen hast, damit er nicht erneut angezeigt
              wird. Läuft nach 1 Jahr ab.
            </li>
            <li>
              <strong>velvetine_analytics_consent</strong> - merkt sich deine
              Wahl bezüglich des optionalen Cookies unten. Läuft nach 1 Jahr
              ab.
            </li>
            <li>
              <strong>NEXT_LOCALE</strong> - merkt sich, welche Sprache du
              gewählt hast, damit du beim nächsten Mal die richtige siehst.
              Wird automatisch vom Sprachwähler gesetzt. Läuft nach 1 Jahr
              ab.
            </li>
          </ul>
        </section>

        <section>
          <h2>Optionales Cookie</h2>
          <p>
            <strong>velvetine_visitor_id</strong> - eine zufällige ID zum
            Zählen eindeutiger Besuche (siehe unsere{" "}
            <Link href="/integritetspolicy" className="text-gold hover:text-gold-bright">
              Datenschutzerklärung
            </Link>
            , Abschnitt 6). Wird nur gesetzt, wenn du &ldquo;Analyse&rdquo;
            unter &ldquo;Verwalten&rdquo; im Cookie-Hinweis aktivierst -
            standardmäßig deaktiviert und sofort entfernt, wenn du es wieder
            ausschaltest. Läuft nach 1 Jahr ab, solange es aktiv ist.
          </p>
        </section>

        <section>
          <h2>Was wir nicht verwenden</h2>
          <p>Keine Werbe- oder Tracking-Cookies und keine Analyse-Tools von Drittanbietern.</p>
        </section>

        <section>
          <h2>Falls wir jemals weitere optionale Cookies hinzufügen</h2>
          <p>
            Wir aktualisieren diese Seite und bitten um deine Einwilligung,
            bevor etwas Neues gesetzt wird - nicht danach.
          </p>
        </section>
      </LegalPage>
    );
  }

  if (locale === "es") {
    return (
      <LegalPage title="Cookies" updated="5 de septiembre de 2026" homeHref={homeHref}>
        <section>
          <h2>Cookies necesarias</h2>
          <p>Estas siempre están activas - el sitio no funciona sin ellas:</p>
          <ul>
            <li>
              <strong>velvetine_session</strong> - te mantiene conectado. Se
              elimina al cerrar sesión, o caduca automáticamente después de
              30 días. No contiene ningún dato personal en sí misma, solo
              una referencia firmada a tu sesión.
            </li>
            <li>
              <strong>velvetine_cookie_consent</strong> - recuerda que has
              visto este aviso, para que no vuelva a mostrarse. Caduca al
              cabo de 1 año.
            </li>
            <li>
              <strong>velvetine_analytics_consent</strong> - recuerda tu
              elección sobre la cookie opcional que se describe a
              continuación. Caduca al cabo de 1 año.
            </li>
            <li>
              <strong>NEXT_LOCALE</strong> - recuerda qué idioma elegiste,
              para que veas el correcto la próxima vez. Se establece
              automáticamente mediante el selector de idioma. Caduca al
              cabo de 1 año.
            </li>
          </ul>
        </section>

        <section>
          <h2>Cookie opcional</h2>
          <p>
            <strong>velvetine_visitor_id</strong> - un identificador
            aleatorio usado para contar visitas únicas (ver nuestra{" "}
            <Link href="/integritetspolicy" className="text-gold hover:text-gold-bright">
              Política de privacidad
            </Link>
            , sección 6). Solo se establece si activas &ldquo;Analítica&rdquo;
            en &ldquo;Gestionar&rdquo; dentro del aviso de cookies -
            desactivada por defecto, y eliminada de inmediato si vuelves a
            desactivarla. Caduca al cabo de 1 año mientras está activa.
          </p>
        </section>

        <section>
          <h2>Lo que no usamos</h2>
          <p>Ninguna cookie de publicidad ni de seguimiento, y ninguna analítica de terceros.</p>
        </section>

        <section>
          <h2>Si alguna vez añadimos más cookies opcionales</h2>
          <p>
            Actualizaremos esta página y pediremos tu consentimiento antes
            de establecer nada nuevo - no después.
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
            <strong>NEXT_LOCALE</strong> - kommer ihåg vilket språk du
            valt, så du hamnar rätt nästa gång. Sätts automatiskt av
            språkväljaren. Går ut efter 1 år.
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
