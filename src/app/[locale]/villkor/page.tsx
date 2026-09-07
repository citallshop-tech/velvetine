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
      <LegalPage title="Terms" updated="September 4, 2026" homeHref={homeHref}>
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
          <h2>3. Conduct</h2>
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
            actions described in section 4.
          </p>
        </section>

        <section>
          <h2>4. Reporting and enforcement</h2>
          <p>
            Any member can report another profile. Reports are reviewed by
            an administrator (with some AI assistance for severity
            assessment) and can result in:
          </p>
          <ul>
            <li><strong>Temporary suspension</strong> - the account can be reactivated</li>
            <li><strong>Permanent ban</strong> - the account is closed for good; data may be retained as evidence in serious cases</li>
            <li><strong>Deletion</strong> - the account and personal data are permanently removed</li>
          </ul>
          <p>
            An account that accumulates repeated confirmed reports is
            automatically suspended (temporarily at five, permanently at
            ten), regardless of what each individual report concerned. In
            very serious cases, an account can be permanently banned
            immediately, without waiting for that threshold.
          </p>
        </section>

        <section>
          <h2>5. Intellectual property</h2>
          <p>
            You own the content you upload (photos, text). By posting it on
            Velvetine, you grant us the right to show it to other members of
            the service. The Velvetine brand and the platform&apos;s design and
            code belong to C it all.
          </p>
        </section>

        <section>
          <h2>6. Limitation of liability</h2>
          <p>
            Velvetine is a meeting place, not a guarantee of how other people
            behave. We are not liable for actions members take toward each
            other outside our control, but we commit to handling reports
            and acting under section 4.
          </p>
        </section>

        <section>
          <h2>7. Changes</h2>
          <p>
            We may update these terms. We&apos;ll notify you in the app or by
            email before material changes take effect, consistent with
            these terms.
          </p>
        </section>

        <section>
          <h2>8. Governing law</h2>
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
          <h2>9. Contact</h2>
          <p>Questions about these terms: [add C it all contact address]</p>
        </section>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Villkor" updated="4 september 2026" homeHref={homeHref}>
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
        <h2>3. Uppförande</h2>
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
          åtgärder enligt punkt 4.
        </p>
      </section>

      <section>
        <h2>4. Rapportering och åtgärder</h2>
        <p>
          Alla medlemmar kan rapportera en annan profil. Rapporter granskas
          av en administratör (med visst AI-stöd för att bedöma
          allvarlighetsgrad) och kan leda till:
        </p>
        <ul>
          <li><strong>Tillfällig avstängning</strong> - kontot kan återaktiveras</li>
          <li><strong>Permanent avstängning</strong> - kontot stängs för gott, uppgifter kan sparas som bevisunderlag vid allvarliga fall</li>
          <li><strong>Radering</strong> - kontot och personuppgifterna tas bort permanent</li>
        </ul>
        <p>
          Ett konto som ackumulerar upprepade bekräftade rapporter stängs
          av automatiskt (tillfälligt vid fem, permanent vid tio),
          oavsett vad varje enskild rapport gällde. Vid mycket allvarliga
          händelser kan ett konto stängas av permanent direkt, utan att
          vänta på att gränsen nås.
        </p>
      </section>

      <section>
        <h2>5. Immateriella rättigheter</h2>
        <p>
          Du äger innehållet du laddar upp (bilder, texter). Genom att
          publicera det på Velvetine ger du oss rätt att visa det för andra
          medlemmar i tjänsten. Velvetine som varumärke och plattformens
          design och kod tillhör C it all.
        </p>
      </section>

      <section>
        <h2>6. Ansvarsbegränsning</h2>
        <p>
          Velvetine är en mötesplats, inte en garanti för hur andra personer
          uppträder. Vi ansvarar inte för handlingar som medlemmar utför
          gentemot varandra utanför vår kontroll, men vi åtar oss att
          hantera rapporter och agera enligt punkt 4.
        </p>
      </section>

      <section>
        <h2>7. Ändringar</h2>
        <p>
          Vi kan uppdatera dessa villkor. Vi meddelar dig i appen eller via
          e-post innan väsentliga ändringar träder i kraft, i enlighet med
          dessa villkor.
        </p>
      </section>

      <section>
        <h2>8. Tillämplig lag</h2>
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
        <h2>9. Kontakt</h2>
        <p>Frågor om villkoren: [fyll i kontaktadress för C it all]</p>
      </section>
    </LegalPage>
  );
}
