import { LegalPage } from "@/components/LegalPage";
import { Link } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  const homeHref = userId ? "/dashboard" : "/";

  if (locale === "en") {
    return (
      <LegalPage title="Privacy Policy" updated="September 4, 2026" homeHref={homeHref}>
        <p className="text-xs">
          The Swedish version of this policy is the legally authoritative
          one. This English version is provided for convenience.
        </p>
        <section>
          <h2>1. Data controller</h2>
          <p>
            C it all (org. no. 851001-4692) is the data controller for
            processing your personal data in Velvetine.
          </p>
        </section>

        <section>
          <h2>2. What data we collect</h2>
          <ul>
            <li>Account details: name, email, password (stored hashed, never in plain text), date of birth, gender, who you&apos;re looking for</li>
            <li>Profile content: photos, bio, answers to profile prompts</li>
            <li>Messages you send to other members</li>
            <li>Payment details (handled by Stripe - we never store your full card details ourselves)</li>
            <li>Reports you make or are the subject of</li>
            <li>Basic, non-identifying visit statistics (see section 6)</li>
          </ul>
        </section>

        <section>
          <h2>2b. Gender and who you&apos;re looking for - a special category of data</h2>
          <p>
            Data about gender and who you&apos;re looking for can reveal sexual
            orientation, which GDPR Article 9 classifies as a special
            category of personal data - the same protection level as
            health data. That&apos;s why you give separate, explicit consent
            specifically for this at registration, instead of it being
            folded into general acceptance of the terms.
          </p>
          <p>
            We never share this data, or the fact that you&apos;re a Velvetine
            member, with advertisers or other third parties for marketing
            purposes. (That&apos;s exactly the kind of sharing that led a
            European regulator to fine a competing dating app for breaching
            Article 9 in 2021.)
          </p>
          <p className="text-xs">
            [Future feature, not built yet: photo-based identity
            verification would involve processing facial geometry, which is
            also a special category (biometric data). That feature would
            need its own separate consent, in addition to this one.]
          </p>
        </section>

        <section>
          <h2>3. Why we process this data (legal basis)</h2>
          <ul>
            <li><strong>Contract</strong> - to provide the service you signed up for</li>
            <li><strong>Legitimate interest</strong> - for safety, reviewing reports, and preventing abuse</li>
            <li><strong>Legal obligation</strong> - e.g. bookkeeping of payments</li>
          </ul>
        </section>

        <section>
          <h2>4. Who we share data with</h2>
          <ul>
            <li><strong>Stripe</strong> - payment processing</li>
            <li><strong>Supabase</strong> - database hosting, servers within the EU (Ireland)</li>
            <li><strong>OpenAI</strong> - used for two things: assessing the severity of reports (only the report&apos;s text, never your profile, photos, or messages), and automatically screening uploaded photos for nudity and content involving minors before they&apos;re accepted. OpenAI offers a free standard Data Processing Addendum with the EU Standard Contractual Clauses required for transfers outside the EU/EEA already built in.</li>
          </ul>
          <p>We never sell your data to third parties.</p>
        </section>

        <section>
          <h2>5. How long we keep data</h2>
          <p>
            As long as your account is active. If you close your own
            account, your personal data (name, email, bio) is overwritten
            immediately. Following a permanent ban after serious incidents,
            data may exceptionally be kept longer, as evidence should a
            criminal investigation become relevant.
          </p>
          <p>
            Chat messages are automatically deleted after 90 days - we
            don&apos;t keep conversations any longer than that, regardless
            of whether the account otherwise stays active.
          </p>
          <p>
            Payment-related bookkeeping records are kept for 7 years after
            the end of the calendar year they concern, per Swedish
            bookkeeping law - this applies regardless of whether the
            account itself is deleted earlier. We also keep a log of when
            consent to processing sensitive data (section 2b) was given or
            withdrawn, as evidence of compliance.
          </p>
        </section>

        <section>
          <h2>6. Cookies and visit statistics</h2>
          <p>
            We count page visits to understand how the service is used.
            This uses a randomly generated cookie (velvetine_visitor_id) that
            is only set if you turn on &ldquo;Analytics&rdquo; in the cookie
            notice - off by default, and removed immediately if you turn it
            back off. See our{" "}
            <Link href="/cookies" className="text-gold hover:text-gold-bright">
              Cookie Policy
            </Link>{" "}
            for the full list of cookies we use.
          </p>
        </section>

        <section>
          <h2>7. Your rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the data we hold about you</li>
            <li>Have inaccurate data corrected</li>
            <li>Request deletion of your data (you can also do this yourself in the app)</li>
            <li>Receive your data in a structured format (data portability)</li>
            <li>Object to certain processing</li>
            <li>Withdraw your consent to processing of gender/who you&apos;re looking for (this effectively ends the ability to be matched - the same as closing your account)</li>
            <li>Complain to a data protection authority if you believe we&apos;re handling your data incorrectly - in Sweden, IMY (Integritetsskyddsmyndigheten); in other countries, your local equivalent</li>
          </ul>
        </section>

        <section>
          <h2>8. Members outside the EU/EEA</h2>
          <p>
            Velvetine is built to work across the countries our payment
            provider supports, not just Sweden. If you&apos;re a UK resident,
            you have the equivalent rights under UK GDPR. If you&apos;re a US
            resident in a state with its own privacy law (e.g. California&apos;s
            CCPA/CPRA), you have rights such as access, deletion, and
            opting out of the sale of personal data - we already don&apos;t sell
            data to anyone, so that opt-out is effectively the default for
            everyone. Where a local law gives you stronger protection than
            described here, that stronger protection applies.
          </p>
        </section>

        <section>
          <h2>9. Age limit</h2>
          <p>Velvetine is only for people aged 18 or older.</p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>Questions about your data: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  if (locale === "de") {
    return (
      <LegalPage title="Datenschutzerklärung" updated="4. September 2026" homeHref={homeHref}>
        <p className="text-xs">
          Die schwedische Version dieser Richtlinie ist die rechtlich
          verbindliche. Diese deutsche Version dient nur der
          Verständlichkeit.
        </p>
        <section>
          <h2>1. Verantwortlicher</h2>
          <p>
            C it all (Org.-Nr. 851001-4692) ist der Verantwortliche für die
            Verarbeitung deiner personenbezogenen Daten in Velvetine.
          </p>
        </section>

        <section>
          <h2>2. Welche Daten wir erheben</h2>
          <ul>
            <li>Kontodaten: Name, E-Mail, Passwort (gehasht gespeichert, nie im Klartext), Geburtsdatum, Geschlecht, wen du suchst</li>
            <li>Profilinhalte: Fotos, Kurzvorstellung, Antworten auf Profilfragen</li>
            <li>Nachrichten, die du an andere Mitglieder sendest</li>
            <li>Zahlungsdaten (verarbeitet von Stripe - wir speichern deine vollständigen Kartendaten niemals selbst)</li>
            <li>Meldungen, die du machst oder von denen du betroffen bist</li>
            <li>Grundlegende, nicht identifizierende Besuchsstatistiken (siehe Abschnitt 6)</li>
          </ul>
        </section>

        <section>
          <h2>2b. Geschlecht und wen du suchst - eine besondere Kategorie personenbezogener Daten</h2>
          <p>
            Angaben zu Geschlecht und wen du suchst können die sexuelle
            Orientierung offenlegen, was Art. 9 der DSGVO als besondere
            Kategorie personenbezogener Daten einstuft - dasselbe
            Schutzniveau wie Gesundheitsdaten. Deshalb gibst du bei der
            Registrierung eine gesonderte, ausdrückliche Einwilligung genau
            hierfür ab, statt dass dies nur Teil der allgemeinen Annahme
            der Bedingungen ist.
          </p>
          <p>
            Wir geben diese Daten, oder die Tatsache, dass du Mitglied bei
            Velvetine bist, niemals zu Marketingzwecken an Werbetreibende
            oder andere Dritte weiter. (Genau diese Art der Weitergabe
            führte 2021 dazu, dass eine europäische Aufsichtsbehörde eine
            konkurrierende Dating-App wegen eines Verstoßes gegen Art. 9
            mit einem Bußgeld belegte.)
          </p>
          <p className="text-xs">
            [Zukünftige Funktion, noch nicht umgesetzt: eine fotobasierte
            Identitätsverifizierung würde die Verarbeitung von
            Gesichtsgeometrie beinhalten, die ebenfalls eine besondere
            Kategorie ist (biometrische Daten). Diese Funktion würde eine
            eigene, zusätzliche Einwilligung erfordern.]
          </p>
        </section>

        <section>
          <h2>3. Warum wir diese Daten verarbeiten (Rechtsgrundlage)</h2>
          <ul>
            <li><strong>Vertrag</strong> - um den Dienst bereitzustellen, für den du dich angemeldet hast</li>
            <li><strong>Berechtigtes Interesse</strong> - für Sicherheit, die Prüfung von Meldungen und die Verhinderung von Missbrauch</li>
            <li><strong>Rechtliche Verpflichtung</strong> - z. B. Buchführung über Zahlungen</li>
          </ul>
        </section>

        <section>
          <h2>4. Mit wem wir Daten teilen</h2>
          <ul>
            <li><strong>Stripe</strong> - Zahlungsabwicklung</li>
            <li><strong>Supabase</strong> - Datenbankhosting, Server innerhalb der EU (Irland)</li>
            <li><strong>OpenAI</strong> - wird für zwei Dinge verwendet: Einschätzung des Schweregrads von Meldungen (nur der Text der Meldung, niemals dein Profil, deine Fotos oder deine Nachrichten) und automatische Prüfung hochgeladener Fotos auf Nacktheit und Inhalte mit Minderjährigen, bevor sie akzeptiert werden. OpenAI bietet eine kostenlose Standard-Auftragsverarbeitungsvereinbarung (DPA) mit den für Übermittlungen außerhalb der EU/des EWR erforderlichen EU-Standardvertragsklauseln bereits integriert an.</li>
          </ul>
          <p>Wir verkaufen deine Daten niemals an Dritte.</p>
        </section>

        <section>
          <h2>5. Wie lange wir Daten aufbewahren</h2>
          <p>
            Solange dein Konto aktiv ist. Wenn du dein Konto selbst
            schließt, werden deine personenbezogenen Daten (Name, E-Mail,
            Kurzvorstellung) sofort überschrieben. Nach einer dauerhaften
            Sperrung wegen schwerwiegender Vorfälle können Daten
            ausnahmsweise länger aufbewahrt werden, als Beweismittel für
            den Fall, dass eine strafrechtliche Untersuchung relevant wird.
          </p>
          <p>
            Chatnachrichten werden automatisch nach 90 Tagen gelöscht - wir
            bewahren Unterhaltungen nicht länger auf, unabhängig davon, ob
            das Konto ansonsten aktiv bleibt.
          </p>
          <p>
            Zahlungsbezogene Buchführungsunterlagen werden gemäß dem
            schwedischen Buchführungsgesetz 7 Jahre nach Ablauf des
            betreffenden Kalenderjahres aufbewahrt - dies gilt unabhängig
            davon, ob das Konto selbst früher gelöscht wird. Wir führen
            außerdem ein Protokoll darüber, wann die Einwilligung zur
            Verarbeitung sensibler Daten (Abschnitt 2b) erteilt oder
            widerrufen wurde, als Nachweis der Einhaltung.
          </p>
        </section>

        <section>
          <h2>6. Cookies und Besuchsstatistiken</h2>
          <p>
            Wir zählen Seitenaufrufe, um zu verstehen, wie der Dienst
            genutzt wird. Dazu wird ein zufällig generiertes Cookie
            (velvetine_visitor_id) verwendet, das nur gesetzt wird, wenn du
            &ldquo;Analyse&rdquo; im Cookie-Hinweis aktivierst - standardmäßig
            deaktiviert und sofort entfernt, wenn du es wieder ausschaltest.
            Die vollständige Liste der von uns verwendeten Cookies findest
            du in unserer{" "}
            <Link href="/cookies" className="text-gold hover:text-gold-bright">
              Cookie-Richtlinie
            </Link>
            .
          </p>
        </section>

        <section>
          <h2>7. Deine Rechte</h2>
          <p>Du hast das Recht:</p>
          <ul>
            <li>Auf die über dich gespeicherten Daten zuzugreifen</li>
            <li>Unrichtige Daten korrigieren zu lassen</li>
            <li>Die Löschung deiner Daten zu verlangen (das kannst du auch selbst in der App tun)</li>
            <li>Deine Daten in einem strukturierten Format zu erhalten (Datenportabilität)</li>
            <li>Bestimmten Verarbeitungen zu widersprechen</li>
            <li>Deine Einwilligung zur Verarbeitung von Geschlecht/wen du suchst zu widerrufen (dies beendet faktisch die Möglichkeit, gematcht zu werden - genauso wie die Schließung deines Kontos)</li>
            <li>Dich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn du der Meinung bist, dass wir deine Daten falsch verarbeiten - in Schweden die IMY (Integritetsskyddsmyndigheten), in anderen Ländern die jeweils zuständige Behörde</li>
          </ul>
        </section>

        <section>
          <h2>8. Mitglieder außerhalb der EU/des EWR</h2>
          <p>
            Velvetine ist so gebaut, dass es in allen Ländern funktioniert,
            die unser Zahlungsanbieter unterstützt, nicht nur in Schweden.
            Wenn du im Vereinigten Königreich ansässig bist, hast du
            gleichwertige Rechte nach dem UK GDPR. Wenn du in einem
            US-Bundesstaat mit eigenem Datenschutzgesetz ansässig bist
            (z. B. Kaliforniens CCPA/CPRA), hast du Rechte wie Zugang,
            Löschung und das Widersprechen gegen den Verkauf
            personenbezogener Daten - wir verkaufen ohnehin niemals Daten
            an irgendjemanden, sodass dieser Opt-out für alle faktisch der
            Standard ist. Gewährt dir dein lokales Recht einen stärkeren
            Schutz als hier beschrieben, gilt dieser stärkere Schutz.
          </p>
        </section>

        <section>
          <h2>9. Altersgrenze</h2>
          <p>Velvetine ist nur für Personen ab 18 Jahren.</p>
        </section>

        <section>
          <h2>10. Kontakt</h2>
          <p>Fragen zu deinen Daten: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  if (locale === "es") {
    return (
      <LegalPage title="Política de privacidad" updated="4 de septiembre de 2026" homeHref={homeHref}>
        <p className="text-xs">
          La versión sueca de esta política es la legalmente vinculante.
          Esta versión en español se ofrece por conveniencia.
        </p>
        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>
            C it all (NIF/org. n.º 851001-4692) es el responsable del
            tratamiento de tus datos personales en Velvetine.
          </p>
        </section>

        <section>
          <h2>2. Qué datos recopilamos</h2>
          <ul>
            <li>Datos de la cuenta: nombre, correo electrónico, contraseña (almacenada cifrada, nunca en texto plano), fecha de nacimiento, género, a quién buscas</li>
            <li>Contenido del perfil: fotos, biografía, respuestas a las preguntas del perfil</li>
            <li>Mensajes que envías a otros miembros</li>
            <li>Datos de pago (gestionados por Stripe - nunca almacenamos nosotros mismos los datos completos de tu tarjeta)</li>
            <li>Reportes que haces o de los que eres objeto</li>
            <li>Estadísticas de visitas básicas y no identificativas (ver sección 6)</li>
          </ul>
        </section>

        <section>
          <h2>2b. Género y a quién buscas - una categoría especial de datos</h2>
          <p>
            Los datos sobre el género y a quién buscas pueden revelar la
            orientación sexual, lo cual el artículo 9 del RGPD clasifica
            como una categoría especial de datos personales - el mismo
            nivel de protección que los datos de salud. Por eso das un
            consentimiento explícito y separado específicamente para esto
            al registrarte, en lugar de que quede incluido en la aceptación
            general de los términos.
          </p>
          <p>
            Nunca compartimos este dato, ni el hecho de que seas miembro de
            Velvetine, con anunciantes u otros terceros con fines de
            marketing. (Ese es exactamente el tipo de intercambio que
            llevó a un regulador europeo a multar a una aplicación de citas
            de la competencia por infringir el artículo 9 en 2021.)
          </p>
          <p className="text-xs">
            [Función futura, aún no implementada: la verificación de
            identidad basada en fotos implicaría procesar la geometría
            facial, que también es una categoría especial (datos
            biométricos). Esa función necesitaría su propio consentimiento
            separado, además de este.]
          </p>
        </section>

        <section>
          <h2>3. Por qué tratamos estos datos (base legal)</h2>
          <ul>
            <li><strong>Contrato</strong> - para prestar el servicio para el que te registraste</li>
            <li><strong>Interés legítimo</strong> - por seguridad, revisión de reportes y prevención de abusos</li>
            <li><strong>Obligación legal</strong> - p. ej., contabilidad de pagos</li>
          </ul>
        </section>

        <section>
          <h2>4. Con quién compartimos datos</h2>
          <ul>
            <li><strong>Stripe</strong> - procesamiento de pagos</li>
            <li><strong>Supabase</strong> - alojamiento de bases de datos, servidores dentro de la UE (Irlanda)</li>
            <li><strong>OpenAI</strong> - se usa para dos cosas: evaluar la gravedad de los reportes (solo el texto del reporte, nunca tu perfil, fotos o mensajes) y examinar automáticamente las fotos subidas en busca de desnudez y contenido que involucre a menores antes de que se acepten. OpenAI ofrece un acuerdo de tratamiento de datos (DPA) estándar y gratuito, con las cláusulas contractuales tipo de la UE necesarias para las transferencias fuera de la UE/EEE ya incorporadas.</li>
          </ul>
          <p>Nunca vendemos tus datos a terceros.</p>
        </section>

        <section>
          <h2>5. Cuánto tiempo conservamos los datos</h2>
          <p>
            Mientras tu cuenta esté activa. Si cierras tu propia cuenta,
            tus datos personales (nombre, correo electrónico, biografía) se
            sobrescriben de inmediato. Tras una suspensión permanente por
            incidentes graves, los datos pueden conservarse
            excepcionalmente más tiempo, como prueba en caso de que resulte
            relevante una investigación penal.
          </p>
          <p>
            Los mensajes de chat se eliminan automáticamente después de 90
            días - no conservamos las conversaciones más tiempo que ese,
            independientemente de que la cuenta siga activa por lo demás.
          </p>
          <p>
            Los registros contables relacionados con pagos se conservan
            durante 7 años tras el final del año natural al que se
            refieren, conforme a la ley sueca de contabilidad - esto se
            aplica independientemente de que la propia cuenta se elimine
            antes. También mantenemos un registro de cuándo se otorgó o
            revocó el consentimiento para el tratamiento de datos sensibles
            (sección 2b), como prueba de cumplimiento.
          </p>
        </section>

        <section>
          <h2>6. Cookies y estadísticas de visitas</h2>
          <p>
            Contamos las visitas a las páginas para entender cómo se usa el
            servicio. Para ello se usa una cookie generada aleatoriamente
            (velvetine_visitor_id) que solo se establece si activas
            &ldquo;Analítica&rdquo; en el aviso de cookies - desactivada por
            defecto, y eliminada de inmediato si vuelves a desactivarla.
            Consulta nuestra{" "}
            <Link href="/cookies" className="text-gold hover:text-gold-bright">
              política de cookies
            </Link>{" "}
            para ver la lista completa de las cookies que usamos.
          </p>
        </section>

        <section>
          <h2>7. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li>Acceder a los datos que tenemos sobre ti</li>
            <li>Solicitar la corrección de datos inexactos</li>
            <li>Solicitar la eliminación de tus datos (también puedes hacerlo tú mismo en la aplicación)</li>
            <li>Recibir tus datos en un formato estructurado (portabilidad de datos)</li>
            <li>Oponerte a determinados tratamientos</li>
            <li>Retirar tu consentimiento al tratamiento de género/a quién buscas (esto pone fin, en la práctica, a la posibilidad de recibir coincidencias - igual que cerrar tu cuenta)</li>
            <li>Reclamar ante una autoridad de protección de datos si consideras que tratamos tus datos incorrectamente - en Suecia, la IMY (Integritetsskyddsmyndigheten); en otros países, tu autoridad local equivalente</li>
          </ul>
        </section>

        <section>
          <h2>8. Miembros fuera de la UE/EEE</h2>
          <p>
            Velvetine está diseñado para funcionar en todos los países que
            admite nuestro proveedor de pagos, no solo en Suecia. Si eres
            residente en el Reino Unido, tienes derechos equivalentes según
            el UK GDPR. Si eres residente en un estado de EE. UU. con su
            propia ley de privacidad (p. ej., la CCPA/CPRA de California),
            tienes derechos como el acceso, la eliminación y la opción de
            excluirte de la venta de datos personales - nosotros ya nunca
            vendemos datos a nadie, por lo que esa exclusión es, en la
            práctica, la opción predeterminada para todos. Cuando la ley
            local te otorgue una protección más fuerte que la descrita
            aquí, se aplicará esa protección más fuerte.
          </p>
        </section>

        <section>
          <h2>9. Edad mínima</h2>
          <p>Velvetine es solo para personas de 18 años o más.</p>
        </section>

        <section>
          <h2>10. Contacto</h2>
          <p>Preguntas sobre tus datos: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Integritetspolicy" updated="4 september 2026" homeHref={homeHref}>
      <section>
        <h2>1. Personuppgiftsansvarig</h2>
        <p>
          C it all (org.nr 851001-4692) är personuppgiftsansvarig för
          behandlingen av dina personuppgifter i Velvetine.
        </p>
      </section>

      <section>
        <h2>2. Vilka uppgifter vi samlar in</h2>
        <ul>
          <li>Kontouppgifter: namn, e-post, lösenord (sparas hashat, aldrig i klartext), födelsedatum, kön, vem du söker</li>
          <li>Profilinnehåll: bilder, presentationstext, svar på profilfrågor</li>
          <li>Meddelanden du skickar till andra medlemmar</li>
          <li>Betalningsuppgifter (hanteras av Stripe - vi lagrar aldrig dina fullständiga kortuppgifter själva)</li>
          <li>Rapporter du gör eller blir föremål för</li>
          <li>Grundläggande, icke-identifierande besöksstatistik (se punkt 6)</li>
        </ul>
      </section>

      <section>
        <h2>2b. Kön och vem du söker - en särskild kategori av uppgift</h2>
        <p>
          Uppgifter om kön och vem du söker kan avslöja sexuell läggning,
          vilket enligt GDPR artikel 9 räknas som en särskild kategori av
          personuppgift - samma skyddsnivå som hälsouppgifter. Det är
          därför du ger ett separat, uttryckligt samtycke till just detta
          vid registrering, istället för att det bara ingår i den
          allmänna godkännandet av villkoren.
        </p>
        <p>
          Vi delar aldrig denna uppgift, eller det faktum att du är
          medlem på Velvetine, med annonsörer eller andra tredje parter i
          marknadsföringssyfte. (Det är precis den typen av delning som
          ledde till att en europeisk tillsynsmyndighet bötfällde en
          konkurrerande dejtingapp för brott mot artikel 9 år 2021.)
        </p>
        <p className="text-xs">
          [Framtida funktion, inte byggd än: foto-baserad
          identitetsverifiering skulle innebära behandling av
          ansiktsgeometri, som också är en särskild kategori (biometrisk
          data). Den funktionen behöver då sitt eget separata samtycke,
          utöver detta.]
        </p>
      </section>

      <section>
        <h2>3. Varför vi behandlar uppgifterna (rättslig grund)</h2>
        <ul>
          <li><strong>Avtal</strong> - för att kunna tillhandahålla tjänsten du registrerat dig för</li>
          <li><strong>Berättigat intresse</strong> - för säkerhet, granskning av rapporter och att förhindra missbruk</li>
          <li><strong>Rättslig förpliktelse</strong> - t.ex. bokföring av betalningar</li>
        </ul>
      </section>

      <section>
        <h2>4. Vem vi delar uppgifter med</h2>
        <ul>
          <li><strong>Stripe</strong> - betalningshantering</li>
          <li><strong>Supabase</strong> - databasdrift, servrar inom EU (Irland)</li>
          <li><strong>OpenAI</strong> - används för två saker: bedöma allvarlighetsgraden i rapporter (bara rapportens text, aldrig din profil, dina bilder eller dina meddelanden), och automatiskt granska uppladdade bilder för nakenhet och innehåll som rör minderåriga innan de godkänns. OpenAI erbjuder ett kostnadsfritt standardavtal (DPA) med de EU-standardavtalsklausuler som krävs för överföring utanför EU/EES inbyggda.</li>
        </ul>
        <p>Vi säljer aldrig dina uppgifter till tredje part.</p>
      </section>

      <section>
        <h2>5. Hur länge vi sparar uppgifter</h2>
        <p>
          Så länge ditt konto är aktivt. Om du avslutar ditt konto själv
          skrivs dina personuppgifter (namn, e-post, bio) över omgående.
          Vid permanent avstängning (&ldquo;banna&rdquo;) efter allvarliga
          incidenter kan uppgifter undantagsvis sparas längre, som
          bevisunderlag om brottsutredning blir aktuell.
        </p>
        <p>
          Meddelanden i chatten raderas automatiskt efter 90 dagar - vi
          sparar inte konversationer längre än så, oavsett om kontot i
          övrigt förblir aktivt.
        </p>
        <p>
          Betalningsrelaterad bokföringsinformation sparas i 7 år efter
          utgången av det kalenderår den avser, enligt bokföringslagens
          krav - det gäller oavsett om kontot i övrigt raderas tidigare.
          Vi sparar även en logg över när samtycke till behandling av
          känsliga uppgifter (punkt 2b) gavs eller återkallades, som bevis
          på att vi följt lagen.
        </p>
      </section>

      <section>
        <h2>6. Cookies och besöksstatistik</h2>
        <p>
          Vi räknar sidvisningar för att förstå hur tjänsten används. Det
          sker med en slumpad cookie (velvetine_visitor_id) som bara sätts om
          du slår på &ldquo;Analys&rdquo; i cookie-rutan - avstängd som
          standard, och tas bort direkt om du stänger av den igen. Se vår{" "}
          <Link href="/cookies" className="text-gold hover:text-gold-bright">
            cookiepolicy
          </Link>{" "}
          för fullständig lista över vilka cookies vi använder.
        </p>
      </section>

      <section>
        <h2>7. Dina rättigheter</h2>
        <p>Du har rätt att:</p>
        <ul>
          <li>Få tillgång till de uppgifter vi har om dig</li>
          <li>Få felaktiga uppgifter rättade</li>
          <li>Begära radering av dina uppgifter (kan du också göra själv i appen)</li>
          <li>Få ut dina uppgifter i ett strukturerat format (dataportabilitet)</li>
          <li>Invända mot viss behandling</li>
          <li>Återkalla ditt samtycke till behandling av kön/vem du söker (avslutar i praktiken möjligheten att matchas - samma som att avsluta kontot)</li>
          <li>Klaga hos en tillsynsmyndighet om du anser att vi hanterar dina uppgifter fel - i Sverige Integritetsskyddsmyndigheten (IMY), i andra länder din lokala motsvarighet</li>
        </ul>
      </section>

      <section>
        <h2>8. Medlemmar utanför EU/EES</h2>
        <p>
          Velvetine är byggt för att fungera i alla länder vår
          betalningsleverantör stödjer, inte bara Sverige. Är du bosatt i
          Storbritannien har du motsvarande rättigheter enligt UK GDPR. Är
          du bosatt i en amerikansk delstat med egen integritetslag (t.ex.
          Kaliforniens CCPA/CPRA) har du rättigheter som tillgång,
          radering och att neka försäljning av personuppgifter - vi säljer
          redan aldrig uppgifter till någon, så det blir i praktiken
          standard för alla. Ger din lokala lag dig ett starkare skydd än
          det som beskrivs här, gäller det starkare skyddet.
        </p>
      </section>

      <section>
        <h2>9. Åldersgräns</h2>
        <p>Velvetine är endast till för personer som är 18 år eller äldre.</p>
      </section>

      <section>
        <h2>10. Kontakt</h2>
        <p>Frågor om dina uppgifter: support@velvetine.app</p>
      </section>
    </LegalPage>
  );
}
