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
            C it all is the data controller for processing your personal
            data in Velvetine. [Add company registration number and contact
            details.]
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
            <li><strong>OpenAI</strong> - used to assess the severity of reports (only the report&apos;s text, never your profile, photos, or messages). OpenAI offers a free standard Data Processing Addendum with the EU Standard Contractual Clauses required for transfers outside the EU/EEA already built in - accepted via a business account in OpenAI&apos;s account settings, no negotiation needed. [Action before going live: log in with Velvetine/C it all&apos;s business account and accept that agreement.]</li>
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
          <p>Questions about your data: [add data protection contact address]</p>
        </section>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Integritetspolicy" updated="4 september 2026" homeHref={homeHref}>
      <section>
        <h2>1. Personuppgiftsansvarig</h2>
        <p>
          C it all är personuppgiftsansvarig för behandlingen av dina
          personuppgifter i Velvetine. [Fyll i organisationsnummer och
          kontaktuppgifter.]
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
          <li><strong>OpenAI</strong> - används för att bedöma allvarlighetsgraden i rapporter (bara rapportens text, aldrig din profil, dina bilder eller dina meddelanden). OpenAI erbjuder ett kostnadsfritt standardavtal (DPA) med de EU-standardavtalsklausuler som krävs för överföring utanför EU/EES inbyggda - godkänns via ett företagskonto hos OpenAI (Data Controls i kontoinställningarna), inga förhandlingar behövs. [Åtgärd innan skarp lansering: logga in med Velvetine/C it alls företagskonto och godkänn det avtalet.]</li>
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
        <p>Frågor om dina uppgifter: [fyll i kontaktadress för dataskyddsfrågor]</p>
      </section>
    </LegalPage>
  );
}
