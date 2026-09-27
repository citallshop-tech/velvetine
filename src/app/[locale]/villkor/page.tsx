import { LegalPage } from "@/components/LegalPage";
import { getSessionUserId } from "@/lib/auth";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  const homeHref = userId ? "/dashboard" : "/";

  if (locale === "en") {
    return (
      <LegalPage title="Terms" updated="September 21, 2026" homeHref={homeHref}>
        <p className="text-xs">
          The Swedish version of these terms is the legally authoritative
          one. This English version is provided for convenience.
        </p>
        <section>
          <h2>1. Who can use Velvetine</h2>
          <p>
            You must be at least 18 to create an account. The details you
            register (name, date of birth, gender) must be accurate -
            providing a false age or identity breaches these terms and can
            lead to your account being suspended or deleted.
          </p>
        </section>

        <section>
          <h2>2. Membership and tiers</h2>
          <p>
            Velvetine offers several paid membership tiers. Your tier is shown
            openly as a badge on your profile, and what&apos;s included in
            each tier is listed in the app (under &ldquo;See tiers and
            pricing&rdquo;). Some tiers require an application and approval
            in addition to payment - paying does not guarantee access to
            such a tier.
          </p>
          <p>
            Membership renews automatically each month until you cancel it.
            You can cancel or change tier at any time under &ldquo;My
            profile&rdquo; in the app - cancellation takes effect from the
            next billing period, and you keep access to your current tier
            for the period you&apos;ve already paid for.
          </p>
          <p>
            If you switch tiers while already an active member, your
            existing payment is changed rather than a second one being
            started - you&apos;re never charged for two tiers at once; the
            difference is calculated automatically (charged or credited).
            Billing, invoices, and cancellation are handled through a
            secure page with our payment provider, Stripe, available from
            &ldquo;Manage membership&rdquo;. We never store your card
            details ourselves.
          </p>
          <p>
            Amounts already paid are not refunded, except where Swedish or
            other applicable consumer law requires it.
          </p>
        </section>

        <section>
          <h2>3. The store and one-time purchases</h2>
          <p>
            In addition to the membership tiers, Velvetine offers a store
            with optional one-time purchases - including frames, chat
            themes, profile backgrounds, and digital gifts that can be sent
            to other members in chat. Each item is shown with its price in
            the app before you buy it.
          </p>
          <p>
            This is digital content delivered directly to your account as
            soon as payment is completed. By completing a purchase in the
            store, you expressly confirm that you want delivery to begin
            immediately, and you agree that your statutory right of
            withdrawal is thereby lost from the moment of delivery, in line
            with the exception for digital content supplied immediately
            (Article 16(m) of the EU Consumer Rights Directive). By
            completing the purchase you also confirm that you have reviewed
            and agree to the price and item shown at the time of purchase,
            and that it matches the information shown elsewhere in the
            store.
          </p>
          <p>
            Amounts already paid for store items are not refunded, except
            where Swedish or other applicable consumer law requires it.
            Digital gifts sent to another member cannot be recalled or
            exchanged once sent.
          </p>
        </section>

        <section>
          <h2>4. Conduct</h2>
          <p>On Velvetine, or in contacts made through Velvetine, you may not:</p>
          <ul>
            <li>Harass, threaten, or demean other members</li>
            <li>Use a false identity or someone else&apos;s photos</li>
            <li>Post or share illegal content</li>
            <li>Use the service to sell or advertise anything</li>
            <li>Contact or target minors, or pose as a minor</li>
          </ul>
          <p>
            What members choose to do with each other outside the platform
            is beyond our control, but we take active responsibility for
            safety on the platform through review, reporting, and the
            actions described in section 5.
          </p>
        </section>

        <section>
          <h2>5. Reporting and enforcement</h2>
          <p>
            Any member can report another profile. Reports are reviewed by
            an administrator (with some AI assistance for severity
            assessment) and can result in:
          </p>
          <ul>
            <li><strong>Temporary suspension</strong> - the account can be reactivated</li>
            <li><strong>Permanent ban</strong> - the account is closed for good; data may be retained as evidence in serious cases</li>
            <li><strong>Deletion</strong> - you can delete your account at any time. Your profile (photos, bio, prompt answers, interests, showcase items, and verification selfie) is then permanently removed. Data linked to reports or safety flags about you is excluded from this and is retained for as long as the law requires, or for as long as an investigation is ongoing, even after the account is deleted - this isn&apos;t treated as part of your profile, but as evidence of a possible rule violation</li>
          </ul>
          <p>
            An account that accumulates ten confirmed reports is
            automatically and permanently banned, regardless of what each
            individual report concerned. Fewer confirmed reports can lead
            to a temporary suspension at an administrator&apos;s discretion. In
            very serious cases, an account can be permanently banned
            immediately, without waiting for any threshold to be reached.
          </p>
        </section>

        <section>
          <h2>6. Intellectual property</h2>
          <p>
            You own the content you upload (photos, text). By posting it on
            Velvetine, you grant us the right to show it to other members of
            the service. The Velvetine brand and the platform&apos;s design and
            code belong to C it all.
          </p>
        </section>

        <section>
          <h2>7. Limitation of liability</h2>
          <p>
            Velvetine is a meeting place, not a guarantee of how other people
            behave. We are not liable for actions members take toward each
            other outside our control, but we commit to handling reports
            and acting under section 5.
          </p>
        </section>

        <section>
          <h2>8. Changes</h2>
          <p>
            We may update these terms. We&apos;ll notify you in the app or by
            email before material changes take effect, consistent with
            these terms.
          </p>
        </section>

        <section>
          <h2>9. Governing law</h2>
          <p>
            These terms are governed by Swedish law. If you&apos;re a consumer
            resident in another EU/EEA country, this doesn&apos;t take away the
            mandatory consumer-protection rights you have under the law of
            your own country of residence (EU Rome I Regulation, Art. 6(2)) -
            those continue to apply regardless of this clause. Nothing here
            limits rights you have under your local law that can&apos;t be
            waived by agreement.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>Questions about these terms: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  if (locale === "de") {
    return (
      <LegalPage title="AGB" updated="21. September 2026" homeHref={homeHref}>
        <p className="text-xs">
          Die schwedische Version dieser Bedingungen ist die rechtlich
          verbindliche. Diese deutsche Version dient nur der
          Verständlichkeit.
        </p>
        <section>
          <h2>1. Wer Velvetine nutzen darf</h2>
          <p>
            Du musst mindestens 18 Jahre alt sein, um ein Konto zu
            erstellen. Die von dir angegebenen Daten (Name, Geburtsdatum,
            Geschlecht) müssen korrekt sein - die Angabe eines falschen
            Alters oder einer falschen Identität verstößt gegen diese
            Bedingungen und kann zur Sperrung oder Löschung deines Kontos
            führen.
          </p>
        </section>

        <section>
          <h2>2. Mitgliedschaft und Stufen</h2>
          <p>
            Velvetine bietet mehrere kostenpflichtige Mitgliedschaftsstufen
            an. Deine Stufe wird offen als Abzeichen auf deinem Profil
            angezeigt, und was in jeder Stufe enthalten ist, findest du in
            der App (unter &ldquo;Stufen und Preise ansehen&rdquo;).
            Manche Stufen erfordern zusätzlich zur Zahlung eine Bewerbung
            und Genehmigung - eine Zahlung garantiert keinen Zugang zu
            einer solchen Stufe.
          </p>
          <p>
            Die Mitgliedschaft verlängert sich automatisch jeden Monat, bis
            du sie kündigst. Du kannst jederzeit unter &ldquo;Mein
            Profil&rdquo; in der App kündigen oder die Stufe wechseln - die
            Kündigung wird zum nächsten Abrechnungszeitraum wirksam, und du
            behältst den Zugang zu deiner aktuellen Stufe für den bereits
            bezahlten Zeitraum.
          </p>
          <p>
            Wenn du als bereits aktives Mitglied die Stufe wechselst, wird
            deine bestehende Zahlung angepasst, statt eine zweite zu
            starten - du wirst nie für zwei Stufen gleichzeitig belastet;
            die Differenz wird automatisch berechnet (belastet oder
            gutgeschrieben). Abrechnung, Rechnungen und Kündigung werden
            über eine sichere Seite unseres Zahlungsanbieters Stripe
            abgewickelt, erreichbar über &ldquo;Mitgliedschaft
            verwalten&rdquo;. Wir speichern deine Kartendaten niemals
            selbst.
          </p>
          <p>
            Bereits gezahlte Beträge werden nicht erstattet, außer soweit
            schwedisches oder anderes anwendbares Verbraucherrecht dies
            vorschreibt.
          </p>
        </section>

        <section>
          <h2>3. Der Shop und Einmalkäufe</h2>
          <p>
            Zusätzlich zu den Mitgliedschaftsstufen bietet Velvetine einen
            Shop mit optionalen Einmalkäufen an - darunter Rahmen,
            Chat-Designs, Profilhintergründe und digitale Geschenke, die du
            anderen Mitgliedern im Chat schicken kannst. Jede Ware wird vor
            dem Kauf mit ihrem Preis in der App angezeigt.
          </p>
          <p>
            Es handelt sich um digitale Inhalte, die sofort nach Abschluss
            der Zahlung auf dein Konto geliefert werden. Mit Abschluss
            eines Kaufs im Shop bestätigst du ausdrücklich, dass die
            Lieferung sofort beginnen soll, und du stimmst zu, dass dein
            gesetzliches Widerrufsrecht damit ab dem Zeitpunkt der Lieferung
            erlischt, gemäß der Ausnahme für sofort gelieferte digitale
            Inhalte (Art. 16 lit. m der EU-Verbraucherrechterichtlinie). Mit
            Abschluss des Kaufs bestätigst du außerdem, dass du den zum
            Kaufzeitpunkt angezeigten Preis und die Ware geprüft hast und
            ihnen zustimmst, und dass sie mit den übrigen Angaben im Shop
            übereinstimmen.
          </p>
          <p>
            Bereits gezahlte Beträge für Shop-Artikel werden nicht
            erstattet, außer soweit schwedisches oder anderes anwendbares
            Verbraucherrecht dies vorschreibt. Digitale Geschenke, die an
            ein anderes Mitglied gesendet wurden, können nach dem Versand
            nicht zurückgerufen oder umgetauscht werden.
          </p>
        </section>

        <section>
          <h2>4. Verhalten</h2>
          <p>Auf Velvetine oder in über Velvetine entstandenen Kontakten darfst du nicht:</p>
          <ul>
            <li>Andere Mitglieder belästigen, bedrohen oder herabwürdigen</li>
            <li>Eine falsche Identität oder fremde Fotos verwenden</li>
            <li>Illegale Inhalte veröffentlichen oder teilen</li>
            <li>Den Dienst nutzen, um etwas zu verkaufen oder zu bewerben</li>
            <li>Minderjährige kontaktieren oder ansprechen, oder sich als minderjährig ausgeben</li>
          </ul>
          <p>
            Was Mitglieder außerhalb der Plattform miteinander vereinbaren,
            liegt außerhalb unserer Kontrolle, aber wir übernehmen aktiv
            Verantwortung für die Sicherheit auf der Plattform durch
            Überprüfung, Meldungen und die in Abschnitt 5 beschriebenen
            Maßnahmen.
          </p>
        </section>

        <section>
          <h2>5. Meldungen und Maßnahmen</h2>
          <p>
            Jedes Mitglied kann ein anderes Profil melden. Meldungen werden
            von einem Administrator geprüft (mit gewisser KI-Unterstützung
            zur Einschätzung des Schweregrads) und können Folgendes zur
            Folge haben:
          </p>
          <ul>
            <li><strong>Vorübergehende Sperrung</strong> - das Konto kann reaktiviert werden</li>
            <li><strong>Dauerhafte Sperrung</strong> - das Konto wird endgültig geschlossen; Daten können in schweren Fällen als Beweismittel aufbewahrt werden</li>
            <li><strong>Löschung</strong> - du kannst dein Konto jederzeit löschen. Dein Profil (Fotos, Bio, Profilfragen, Interessen, Vorzeigeobjekte und Verifizierungsselfie) wird dann dauerhaft entfernt. Daten im Zusammenhang mit Meldungen oder Sicherheitsmarkierungen über dich sind davon ausgenommen und werden so lange aufbewahrt, wie es das Gesetz verlangt oder eine Untersuchung läuft, auch nach der Löschung des Kontos - das zählt nicht als Teil deines Profils, sondern als Beweismittel für einen möglichen Regelverstoß</li>
          </ul>
          <p>
            Ein Konto, das zehn bestätigte Meldungen ansammelt, wird
            automatisch dauerhaft gesperrt, unabhängig davon, worum es bei
            der jeweiligen Meldung ging. Weniger bestätigte Meldungen
            können nach Einschätzung eines Administrators zu einer
            vorübergehenden Sperrung führen. In besonders schweren Fällen
            kann ein Konto sofort dauerhaft gesperrt werden, ohne dass
            eine Schwelle abgewartet wird.
          </p>
        </section>

        <section>
          <h2>6. Geistiges Eigentum</h2>
          <p>
            Die von dir hochgeladenen Inhalte (Fotos, Texte) gehören dir.
            Indem du sie auf Velvetine veröffentlichst, räumst du uns das
            Recht ein, sie anderen Mitgliedern des Dienstes zu zeigen. Die
            Marke Velvetine sowie Design und Code der Plattform gehören
            C it all.
          </p>
        </section>

        <section>
          <h2>7. Haftungsbeschränkung</h2>
          <p>
            Velvetine ist ein Ort zum Kennenlernen, keine Garantie für das
            Verhalten anderer Personen. Wir haften nicht für Handlungen,
            die Mitglieder außerhalb unserer Kontrolle gegeneinander
            vornehmen, verpflichten uns aber, Meldungen zu bearbeiten und
            gemäß Abschnitt 5 zu handeln.
          </p>
        </section>

        <section>
          <h2>8. Änderungen</h2>
          <p>
            Wir können diese Bedingungen aktualisieren. Wir benachrichtigen
            dich in der App oder per E-Mail, bevor wesentliche Änderungen
            in Kraft treten, im Einklang mit diesen Bedingungen.
          </p>
        </section>

        <section>
          <h2>9. Anwendbares Recht</h2>
          <p>
            Für diese Bedingungen gilt schwedisches Recht. Wenn du als
            Verbraucher in einem anderen EU-/EWR-Land ansässig bist, nimmt
            dir das nicht die zwingenden Verbraucherschutzrechte, die dir
            nach dem Recht deines Wohnsitzlandes zustehen (EU-Rom-I-
            Verordnung, Art. 6 Abs. 2) - diese gelten ungeachtet dieser
            Klausel weiterhin. Nichts hier schränkt Rechte ein, die dir
            nach deinem lokalen Recht zustehen und die nicht durch
            Vereinbarung ausgeschlossen werden können.
          </p>
        </section>

        <section>
          <h2>10. Kontakt</h2>
          <p>Fragen zu diesen Bedingungen: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  if (locale === "es") {
    return (
      <LegalPage title="Términos" updated="21 de septiembre de 2026" homeHref={homeHref}>
        <p className="text-xs">
          La versión sueca de estos términos es la legalmente vinculante.
          Esta versión en español se ofrece por conveniencia.
        </p>
        <section>
          <h2>1. Quién puede usar Velvetine</h2>
          <p>
            Debes tener al menos 18 años para crear una cuenta. Los datos
            que registras (nombre, fecha de nacimiento, género) deben ser
            correctos - proporcionar una edad o identidad falsa incumple
            estos términos y puede dar lugar a la suspensión o eliminación
            de tu cuenta.
          </p>
        </section>

        <section>
          <h2>2. Membresía y niveles</h2>
          <p>
            Velvetine ofrece varios niveles de membresía de pago. Tu nivel
            se muestra abiertamente como una insignia en tu perfil, y lo
            que incluye cada nivel se detalla en la aplicación (en
            &ldquo;Ver precios y niveles&rdquo;). Algunos niveles requieren
            una solicitud y aprobación además del pago - pagar no garantiza
            el acceso a dicho nivel.
          </p>
          <p>
            La membresía se renueva automáticamente cada mes hasta que la
            canceles. Puedes cancelar o cambiar de nivel en cualquier
            momento en &ldquo;Mi perfil&rdquo; en la aplicación - la
            cancelación surte efecto a partir del siguiente periodo de
            facturación, y conservas el acceso a tu nivel actual durante el
            periodo que ya has pagado.
          </p>
          <p>
            Si cambias de nivel siendo ya miembro activo, tu pago existente
            se modifica en lugar de iniciarse uno segundo - nunca se te
            cobra por dos niveles a la vez; la diferencia se calcula
            automáticamente (se te cobra o se te abona). La facturación,
            las facturas y la cancelación se gestionan a través de una
            página segura de nuestro proveedor de pagos, Stripe, disponible
            desde &ldquo;Gestionar membresía&rdquo;. Nunca almacenamos
            nosotros mismos los datos de tu tarjeta.
          </p>
          <p>
            Los importes ya pagados no se reembolsan, salvo cuando la
            legislación sueca u otra normativa de protección al consumidor
            aplicable lo exija.
          </p>
        </section>

        <section>
          <h2>3. La tienda y las compras únicas</h2>
          <p>
            Además de los niveles de membresía, Velvetine ofrece una tienda
            con compras únicas opcionales - entre ellas marcos, temas de
            chat, fondos de perfil y regalos digitales que se pueden enviar
            a otros miembros en el chat. Cada artículo se muestra con su
            precio en la aplicación antes de comprarlo.
          </p>
          <p>
            Se trata de contenido digital que se entrega directamente a tu
            cuenta en cuanto se completa el pago. Al completar una compra
            en la tienda, confirmas expresamente que deseas que la entrega
            comience de inmediato, y aceptas que tu derecho legal de
            desistimiento se pierde a partir de ese momento, conforme a la
            excepción para contenido digital suministrado de forma
            inmediata (artículo 16, letra m, de la Directiva de la UE sobre
            derechos de los consumidores). Al completar la compra también
            confirmas que has revisado y aceptas el precio y el artículo
            mostrados en el momento de la compra, y que coinciden con la
            demás información de la tienda.
          </p>
          <p>
            Los importes ya pagados por artículos de la tienda no se
            reembolsan, salvo cuando la legislación sueca u otra normativa
            de protección al consumidor aplicable lo exija. Los regalos
            digitales enviados a otro miembro no se pueden recuperar ni
            cambiar una vez enviados.
          </p>
        </section>

        <section>
          <h2>4. Conducta</h2>
          <p>En Velvetine, o en los contactos establecidos a través de Velvetine, no puedes:</p>
          <ul>
            <li>Acosar, amenazar o menospreciar a otros miembros</li>
            <li>Usar una identidad falsa o fotos de otra persona</li>
            <li>Publicar o compartir contenido ilegal</li>
            <li>Usar el servicio para vender o anunciar algo</li>
            <li>Contactar o dirigirte a menores, o hacerte pasar por menor</li>
          </ul>
          <p>
            Lo que los miembros decidan hacer entre ellos fuera de la
            plataforma escapa a nuestro control, pero asumimos activamente
            la responsabilidad de la seguridad en la plataforma mediante la
            revisión, los reportes y las medidas descritas en la sección 5.
          </p>
        </section>

        <section>
          <h2>5. Reportes y medidas</h2>
          <p>
            Cualquier miembro puede reportar otro perfil. Los reportes son
            revisados por un administrador (con cierta ayuda de IA para
            evaluar la gravedad) y pueden dar lugar a:
          </p>
          <ul>
            <li><strong>Suspensión temporal</strong> - la cuenta puede reactivarse</li>
            <li><strong>Suspensión permanente</strong> - la cuenta se cierra definitivamente; los datos pueden conservarse como prueba en casos graves</li>
            <li><strong>Eliminación</strong> - puedes eliminar tu cuenta en cualquier momento. Tu perfil (fotos, biografía, respuestas de perfil, intereses, elementos destacados y selfie de verificación) se elimina entonces de forma permanente. Los datos relacionados con reportes o marcas de seguridad sobre ti quedan excluidos y se conservan durante el tiempo que exija la ley o mientras dure una investigación, incluso después de eliminar la cuenta - esto no se considera parte de tu perfil, sino prueba de una posible infracción</li>
          </ul>
          <p>
            Una cuenta que acumula diez reportes confirmados se suspende
            permanentemente de forma automática, independientemente de lo
            que tratara cada reporte individual. Un número menor de
            reportes confirmados puede dar lugar a una suspensión temporal
            a criterio de un administrador. En casos muy graves, una
            cuenta puede ser suspendida permanentemente de inmediato, sin
            esperar a alcanzar ningún umbral.
          </p>
        </section>

        <section>
          <h2>6. Propiedad intelectual</h2>
          <p>
            El contenido que subes (fotos, texto) es tuyo. Al publicarlo en
            Velvetine, nos concedes el derecho de mostrarlo a otros
            miembros del servicio. La marca Velvetine y el diseño y código
            de la plataforma pertenecen a C it all.
          </p>
        </section>

        <section>
          <h2>7. Limitación de responsabilidad</h2>
          <p>
            Velvetine es un lugar de encuentro, no una garantía del
            comportamiento de otras personas. No somos responsables de las
            acciones que los miembros lleven a cabo entre sí fuera de
            nuestro control, pero nos comprometemos a gestionar los
            reportes y actuar conforme a la sección 5.
          </p>
        </section>

        <section>
          <h2>8. Cambios</h2>
          <p>
            Podemos actualizar estos términos. Te avisaremos en la
            aplicación o por correo electrónico antes de que entren en
            vigor cambios sustanciales, de conformidad con estos términos.
          </p>
        </section>

        <section>
          <h2>9. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la ley sueca. Si eres consumidor
            residente en otro país de la UE/EEE, esto no elimina los
            derechos imperativos de protección al consumidor que tienes
            según la ley de tu país de residencia (Reglamento Roma I de la
            UE, art. 6.2) - estos siguen aplicándose independientemente de
            esta cláusula. Nada de lo aquí dispuesto limita los derechos
            que tengas según tu legislación local que no puedan renunciarse
            por acuerdo.
          </p>
        </section>

        <section>
          <h2>10. Contacto</h2>
          <p>Preguntas sobre estos términos: support@velvetine.app</p>
        </section>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Villkor" updated="21 september 2026" homeHref={homeHref}>
      <section>
        <h2>1. Vem får använda Velvetine</h2>
        <p>
          Du måste vara minst 18 år för att skapa ett konto. Uppgifterna du
          registrerar (namn, födelsedatum, kön) ska vara korrekta - att
          uppge en falsk ålder eller identitet är ett brott mot dessa
          villkor och kan leda till att kontot stängs av eller raderas.
        </p>
      </section>

      <section>
        <h2>2. Medlemskap och nivåer</h2>
        <p>
          Velvetine erbjuder flera betalda medlemsnivåer. Din nivå visas
          öppet som ett märke på din profil, och vad som ingår i varje
          nivå framgår av nivålistan i appen (under &ldquo;Se nivåer och
          priser&rdquo;). Vissa nivåer kräver en ansökan och ett
          godkännande utöver betalningen - att betala garanterar inte
          tillträde till en sådan nivå.
        </p>
        <p>
          Medlemskapet förnyas automatiskt varje månad tills du säger upp
          det. Du kan säga upp eller byta nivå när som helst under &ldquo;Min
          profil&rdquo; i appen - uppsägningen gäller från nästa
          betalningsperiod, och du behåller tillgång till din nuvarande
          nivå ut den period du redan betalat för.
        </p>
        <p>
          Byter du till en annan nivå medan du redan har ett aktivt
          medlemskap ändras din befintliga betalning - du betalar aldrig
          för två nivåer samtidigt, mellanskillnaden räknas ut
          automatiskt (mer om detta betalas eller krediteras). Betalning,
          fakturor och uppsägning hanteras via en säker betalsida hos vår
          betalningsleverantör Stripe, tillgänglig från &ldquo;Hantera
          medlemskap&rdquo;. Vi lagrar aldrig dina kortuppgifter själva.
        </p>
        <p>
          Redan betalda perioder återbetalas inte, förutom där svensk
          eller annan tillämplig konsumentlagstiftning kräver det.
        </p>
      </section>

      <section>
        <h2>3. Butiken och engångsköp</h2>
        <p>
          Utöver medlemsnivåerna erbjuder Velvetine en butik med
          valfria engångsköp - bland annat ramar, chattfärger,
          profilbakgrunder och digitala gåvor som kan skickas till andra
          medlemmar i chatten. Varje vara visas med sitt pris i appen
          innan du köper den.
        </p>
        <p>
          Det här är digitalt innehåll som levereras direkt till ditt
          konto så snart betalningen är genomförd. Genom att slutföra ett
          köp i butiken bekräftar du uttryckligen att du vill att
          leveransen ska påbörjas omedelbart, och du samtycker till att
          din ångerrätt därmed går förlorad från och med leveransen, i
          enlighet med undantaget för digitalt innehåll som levereras
          direkt (2 kap. 11 § punkt 13 lagen om distansavtal och avtal
          utanför affärslokaler, som genomför artikel 16 m i EU:s
          konsumenträttighetsdirektiv). Genom att slutföra köpet
          bekräftar du också att du har läst och godkänner det pris och
          den vara som visas vid köptillfället, och att det stämmer
          överens med den övriga informationen i butiken.
        </p>
        <p>
          Belopp som redan betalats för butiksvaror återbetalas inte,
          förutom där svensk eller annan tillämplig
          konsumentlagstiftning kräver det. Digitala gåvor som skickas
          till en annan medlem kan inte återkallas eller bytas ut när de
          har skickats.
        </p>
      </section>

      <section>
        <h2>4. Uppförande</h2>
        <p>Du får inte, på Velvetine eller i kontakter som uppstått via Velvetine:</p>
        <ul>
          <li>Trakassera, hota eller kränka andra medlemmar</li>
          <li>Använda en falsk identitet eller andras bilder</li>
          <li>Publicera eller dela olagligt innehåll</li>
          <li>Använda tjänsten för att sälja eller annonsera något</li>
          <li>Kontakta eller ge sig på minderåriga, eller utge sig för att vara minderårig</li>
        </ul>
        <p>
          Vad medlemmar väljer att göra sinsemellan utanför plattformen
          ligger utanför vår kontroll, men vi tar aktivt ansvar för
          säkerheten på plattformen genom granskning, rapportering och
          åtgärder enligt punkt 5.
        </p>
      </section>

      <section>
        <h2>5. Rapportering och åtgärder</h2>
        <p>
          Alla medlemmar kan rapportera en annan profil. Rapporter granskas
          av en administratör (med visst AI-stöd för att bedöma
          allvarlighetsgrad) och kan leda till:
        </p>
        <ul>
          <li><strong>Tillfällig avstängning</strong> - kontot kan återaktiveras</li>
          <li><strong>Permanent avstängning</strong> - kontot stängs för gott, uppgifter kan sparas som bevisunderlag vid allvarliga fall</li>
          <li><strong>Radering</strong> - du kan när som helst radera ditt konto. Din profil (bilder, bio, profilfrågor, intressen, skrytprylar och verifieringsselfie) tas då bort permanent. Uppgifter kopplade till rapporter eller säkerhetsflaggor om dig är undantagna och sparas så länge lagen kräver det eller så länge en utredning pågår, även efter att kontot raderats - det räknas inte som din profil, utan som bevisunderlag om ett eventuellt regelbrott</li>
        </ul>
        <p>
          Ett konto som ackumulerar tio bekräftade rapporter stängs av
          permanent automatiskt, oavsett vad varje enskild rapport gällde.
          Färre bekräftade rapporter kan leda till en tillfällig
          avstängning efter en administratörs bedömning. Vid mycket
          allvarliga händelser kan ett konto stängas av permanent direkt,
          utan att vänta på att någon gräns nås.
        </p>
      </section>

      <section>
        <h2>6. Immateriella rättigheter</h2>
        <p>
          Du äger innehållet du laddar upp (bilder, texter). Genom att
          publicera det på Velvetine ger du oss rätt att visa det för andra
          medlemmar i tjänsten. Velvetine som varumärke och plattformens
          design och kod tillhör C it all.
        </p>
      </section>

      <section>
        <h2>7. Ansvarsbegränsning</h2>
        <p>
          Velvetine är en mötesplats, inte en garanti för hur andra personer
          uppträder. Vi ansvarar inte för handlingar som medlemmar utför
          gentemot varandra utanför vår kontroll, men vi åtar oss att
          hantera rapporter och agera enligt punkt 5.
        </p>
      </section>

      <section>
        <h2>8. Ändringar</h2>
        <p>
          Vi kan uppdatera dessa villkor. Vi meddelar dig i appen eller via
          e-post innan väsentliga ändringar träder i kraft, i enlighet med
          dessa villkor.
        </p>
      </section>

      <section>
        <h2>9. Tillämplig lag</h2>
        <p>
          Svensk lag gäller för dessa villkor. Om du är konsument bosatt i
          ett annat EU/EES-land tar det här inte bort de tvingande
          konsumentskyddsregler du har enligt lagen i ditt eget hemland
          (EU:s Rom I-förordning, artikel 6.2) - de gäller fortfarande
          oavsett den här klausulen. Inget här begränsar rättigheter du har
          enligt din lokala lag som inte kan avtalas bort.
        </p>
      </section>

      <section>
        <h2>10. Kontakt</h2>
        <p>Frågor om villkoren: support@velvetine.app</p>
      </section>
    </LegalPage>
  );
}
