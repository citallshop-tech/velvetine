# Velvetine

Första batchen: projektgrund, databasschema, registrering/inloggning med
18+-spärr, kontoradering, och grundsidorna i den varma/lyxiga stilen.

Stripe, Resend, OpenAI och bildlagring är **inte** kopplade än — de kommer
i nästa batch. Allt nedan går att köra utan dem.

## 1. Packa upp

Extrahera zip-filen i mappen du skapade, t.ex. `C:\Users\chris\Desktop\velvetine`.
Öppna den mappen i VS Code.

## 2. Installera beroenden

I VS Code-terminalen, i projektmappen:

```bash
npm install
```

## 3. Sätt upp miljövariabler

Kopiera `.env.example` till en ny fil som heter `.env` (samma mapp):

```bash
cp .env.example .env
```

Öppna `.env` och fyll i:

- **DATABASE_URL** — connection-strängen du kopierade från Supabase
  (Project Settings → Database → Connection string → läget **Transaction**)
- **JWT_SECRET** — vilken lång slumpad sträng som helst. Du kan generera en med:

```bash
openssl rand -base64 32
```

*(kör i VS Code-terminalen, klistra in resultatet i .env)*

## 4. Skapa databastabellerna

```bash
npx prisma generate
```

```bash
npm run db:push
```

Det här skapar alla tabeller i din Supabase-databas utifrån schemat i
`prisma/schema.prisma`. Ingen data skrivs över — det är en tom databas som
fylls med struktur.

## 5. Lägg in startdata (nivåerna)

```bash
npm run db:seed
```

Det här skapar de 5 medlemsnivåerna (namnen är platshållare — säg till om
du vill döpa om dem) och några startfrågor till profilerna.

## 6. Starta

```bash
npm run dev
```

Öppna `http://localhost:3000` i webbläsaren. Du bör se startsidan, och
kunna skapa ett konto via "Ansök om medlemskap".

## Adminsidan

En intern sida på `/admin` för att hantera medlemmar, ansökningar till
nivåer som kräver godkännande, och rapporter. Ingen länk till den syns
någonstans i appen - du navigerar dit direkt via adressen.

**Första gången:** du måste redan ha ett vanligt konto (skapat via
"Ansök om medlemskap") innan du kan göra dig själv till admin:

```bash
npm run admin:promote -- din@epost.se
```

Byt `din@epost.se` mot e-posten du registrerade kontot med. Logga sedan
in som vanligt och gå till `http://localhost:3000/admin`.

Betalningsöversikt och AI-granskningar dyker upp där när Stripe och
OpenAI är kopplade in i en senare batch. Besöksstatistik (sidvisningar,
unika besökare) är en separat funktion som inte är byggd än.

## Statistik

Under `/admin/stats` finns två linjediagram över de senaste 30 dagarna:
besökare (sidvisningar + unika besökare) och nya medlemmar vs. avslutade
konton. Ingen ny tjänst behövs - besöksräkningen är en egen enkel lösning
i databasen, ingen cookie eller sparad IP-adress, så ingen samtyckesruta
krävs för den. Adminsidorna själva räknas inte som besök.

## Bläddra, matcha, chatta

- `/discover` — bläddra bland andra aktiva profiler, gilla/nej tack
- Vid ömsesidigt gillande skapas en matchning automatiskt
- `/matches` — lista över matchningar, klicka in för att chatta
- Blockera/rapportera finns som en "•••"-meny på profiler och i chatten

**För att testa själv:** du behöver minst två konton med kön/söker-inställningar
som matchar varandra (annars visar inte bläddra-flödet något). Registrera ett
andra testkonto i ett inkognitofönster.

Ingen bilduppladdning än — profiler visar en cirkel med första bokstaven i
namnet istället för foto. Chatten uppdateras inte av sig själv; det finns en
"Uppdatera"-knapp i konversationen för att hämta nya meddelanden.

## Moderering (tre nivåer)

- **Stäng av** — tillfälligt, kan återaktiveras, ingen data rörs
- **Banna** — permanent, men all data behålls (t.ex. om polis behöver den senare)
- **Radera** — permanent, personuppgifter (namn, e-post, bio) skrivs över

Både medlemslistan och rapportkön i admin har dessa val.

## AI-granskning och varningssystem

Rapporter bedöms automatiskt av OpenAI (allvarlighetsgrad + kort
sammanfattning) om `OPENAI_API_KEY` är ifylld i `.env` - annars visas bara
"Ingen AI-granskning" och admin löser rapporter manuellt som innan, inget
går sönder.

Varje bekräftad rapport (admin väljer "Stäng av" eller "Banna" vid
lösning) ger kontot en varning:

- **5 varningar** → tillfällig avstängning (om inte redan bannat)
- **10 varningar** → permanent avstängning, oavsett vad admin valde för
  just den rapporten

Mycket allvarliga fall kan fortfarande bannas direkt av admin, oavsett
varningsantal.

## Villkor och integritetspolicy

Riktiga utkast finns på `/villkor` och `/integritetspolicy`, länkade från
startsidan och registreringsformuläret. **Låt en jurist granska dem innan
skarp lansering** - särskilt delen om att skicka rapportdata till OpenAI
(ett företag utanför EU), som troligen behöver ett giltigt
överföringsavtal (t.ex. EU:s standardavtalsklausuler).

## Samtycke för känsliga uppgifter

Registreringen kräver nu ett separat, ikryssat samtycke för att behandla
kön/vem du söker - de kan avslöja sexuell läggning, vilket GDPR artikel 9
klassar som en särskild kategori uppgift som behöver eget samtycke, inte
bara ingå i allmänna villkor. Grundat i en verklig tillsynsdom (Grindr,
Norge 2021), inte en gissning.

## Om policysidorna

Efter research (inte bara en generisk friskrivning): OpenAI har ett
kostnadsfritt självbetjänings-DPA med EU-standardavtalsklausuler redan
inbyggda - godkänns via ett företagskonto i OpenAIs kontoinställningar,
inga förhandlingar behövs. IMY har egna gratis mallar/vägledning för
mikroföretag. Policysidorna (`/villkor`, `/integritetspolicy`) är
uppdaterade utifrån detta. Det ersätter inte en jurist för allt, men det
är grundat i riktiga källor, inte antaganden.

## Enhetlig navigering

Alla sidor (utom adminpanelen, som har sin egen meny) delar nu samma
header (logo + tillbaka-länk där det är relevant) och samma footer
(villkor/integritetspolicy) via `AppHeader`/`AppFooter`.

I bläddra-flödet finns nu en **"Tillbaka"**-knapp som ångrar senaste
gilla/nej tack - tar bort swipen från databasen, och om den precis
skapade en matchning utan att något meddelande hunnit skickas, ångras
matchningen också.

## Flera språk (svenska/engelska)

Sidorna finns nu på `/sv/...` och `/en/...` - en språkväljare (SV/EN) syns
i headern på varje sida. Adminpanelen är avsiktligt kvar på bara svenska.
Villkor och integritetspolicy har egna, fullständiga engelska texter (inte
maskinöversatta bit-för-bit) - den svenska versionen är juridiskt
huvudversionen, det står tydligt i den engelska.

Efter `npm install` (ny paket: `next-intl`) fungerar allt som innan, bara
med `/sv` eller `/en` i adressen. Ingen databasändring den här gången.

## Automatisk återaktivering och villkorsaviseringar

Tillfälliga avstängningar (från admin eller från en löst rapport) får nu
ett datum de går ut. Ingen bakgrundsjobb-motor finns i projektet, så
återaktiveringen sker "lat" - kollas och genomförs automatiskt nästa gång
personen försöker logga in eller ladda sin dashboard efter att tiden gått
ut. Admin kan även återaktivera direkt manuellt när som helst.

Under Översikt i admin finns en knapp "Avisera medlemmar om uppdaterade
villkor" - skriver ett kort meddelande, skickar det (med länkar till
villkor/integritetspolicy) till alla aktiva medlemmar. Kräver
`RESEND_API_KEY` för att faktiskt skicka; annars skrivs det ut i
terminalen precis som återställningslänkarna.

## Redigera profil

`/profile` (länk från dashboard) - bio, svar på profilfrågor, och
intressen. Det som visas i bläddra-flödet kommer härifrån. Bilder går
fortfarande inte att ladda upp - väntar på en bildlagringstjänst
(Vercel Blob eller liknande).

## Fler profilfält + språkbugg fixad

Nivånamn och profilfrågor visades på svenska oavsett valt språk - de
kommer från databasen, inte översättningsfilerna, och hade ingen engelsk
variant. Fixat (nya `nameEn`/`questionEn`-fält, ifyllda av `db:seed`).

Nya profilfält: längd, yrke, vad du söker (seriöst/avslappnat/vänskap/vet
inte än) - redigeras på `/profile`, visas i bläddra-flödet. Medvetet
uteslutet: religion, etnicitet och liknande - de räknas som särskilda
kategorier under GDPR (samma regel som kön/läggning) och skulle behöva
eget samtycke, inte bara läggas till som vanliga fält.

## Se vem som gillat dig (nivåförmån)

`/likes` - visar inkommande gillningar, låst bakom nivå Utvald (nivå 2)
och uppåt. Gilla tillbaka skapar en matchning direkt, eftersom personen
redan gillat dig. De andra tre förmånerna (inkognito, auto-blur,
prioriterad synlighet) väntar tills du säger vilken som är näst.

## Förhandsgranskning på redigera-profil

`/profile` visar nu överst exakt hur profilen ser ut för andra i
bläddra-flödet, uppdateras direkt när du skriver - innan du sparar något.
Samma kort återanvänds i själva bläddra-flödet (`ProfileCard`-komponenten),
så det är en garanterat exakt förhandsvisning, inte en gissning.

## Inkognitoläge (nivåförmån)

Från nivån Reserverad (nivå 3) och uppåt — en knapp på dashboard slår av
och på om man syns i andras bläddra-flöde. Påverkar inte befintliga
matchningar/chattar, bara framtida upptäckt. Kvar: auto-blur och
prioriterad synlighet.

## Skrytprylar

`/profile` har en ny sektion — lägg till bil, båt, plan, hus, husdjur
eller annat (text + valfri beskrivning, max 6 st). Visas i
förhandsgranskningen direkt, och i bläddra-flödet för andra. Bilder på
sakerna väntar på samma bildlagringstjänst som profilfoton.

## Bilder (Vercel Blob)

Klart och kopplat. På `/profile`: ladda upp upp till 6 bilder, välj
huvudbild, ta bort. Andra ser dem som en bläddringsbar karusell (pilar +
prickar) i bläddra-flödet - samma kort som förhandsgranskningen. Foton
går även att lägga till per skrytpryl.

## Auto-blur (sista nivåförmånen)

I bläddra-flödet: om någon har en högre nivå än dig visas deras bild
blurrad med ett lås-ikon, tills du uppgraderar till samma nivå eller
högre. Namn, ålder, nivåmärke och bio syns som vanligt — bara bilden är
låst, det är den som lockar till uppgradering.

Blur försvinner automatiskt vid matchning, eftersom en matchad person
aldrig visas i bläddra-flödet igen (redan uteslutet där) — matchningar
och chatt använder inte blur-komponenten alls, så kravet "ingen blind
dejt" är uppfyllt utan extra logik.

Inte med i den här omgången: "Vem gillar dig"-listan visar inga bilder
alls än (bara bokstavscirklar), så blur är inte relevant där ännu.

## Klicka för att förstora bilder

Skrytprylarnas bilder är nu större (64px istället för 40px) och klickbara
— öppnar en fullstorleksvy med bildtext. Huvudprofilbilden går också att
klicka på för samma sak (fungerar inte på en blurrad/låst bild, det vore
ju att kringgå hela nivålåset).

## Rättat: liten popup-bild (verklig orsak)

Den riktiga boven var en annan än jag först trodde: `max-width`/
`max-height` i CSS kan bara krympa en bild, aldrig förstora den. Om
källbilden är lågupplöst (t.ex. en liten testbild), visades den i sin
verkliga, små storlek oavsett hur stor popupen i övrigt var. Fixat genom
att ge popupen en egen, generös fast storlek som bilden alltid fyller ut
(med viss uppskalning om originalet är litet) - inte fixat med portal-
lösningen från förra rättningen, men den var ändå värd att göra (den
löste ett verkligt, separat clipping-problem).

## Cookie-samtycke

En banderoll längst ner visas för nya besökare, med länk till en ny sida
`/cookies` som ärligt listar de två cookies som faktiskt används (båda
nödvändiga: inloggning + att komma ihåg samtycket) - inga annons- eller
spårningscookies finns. "Cookie-inställningar" i sidfoten öppnar
banderollen igen för granskning när som helst.

## Installerbar app (PWA)

Riktig implementation, inte bara en knapp för syns skull:

- Riktiga ikonfiler (genererade, matchar er guld/vinröd/mörk palett) i
  rätt storlekar, en riktig manifest-fil, och en service worker som
  faktiskt cachar statiska filer och visar en offline-sida om nätet
  försvinner - den låtsas inte bara finnas.
- **"Installera"-knappen visas bara när webbläsaren själv bekräftar att
  appen går att installera** - ingen falsk knapp som inte gör något. På
  iPhone (som aldrig ger den bekräftelsen) visas istället riktiga
  instruktioner för "Dela → Lägg till på hemskärmen".
- Service workern registreras **medvetet inte** i `npm run dev` - det var
  precis en aktiv service worker från ett annat projekt som orsakade
  krångel tidigare i det här samtalet. Den aktiveras bara i en riktig
  produktionsbygge.

**För att testa på riktigt** (inte `npm run dev` - installation syns bara
i en riktig bygge):
```powershell
npm run build
npm run start
```
Öppna `http://localhost:3000` i Chrome. Efter en liten stund ska en
"Installera Velvetine som app?"-ruta dyka upp nere till höger.

En bugg jag hittade och rättade *innan* leverans genom att faktiskt köra
byggkommandot: den första versionen av `favicon.ico` var i fel
bildformat (RGB istället för RGBA) och kraschade bygget helt. Byggd om,
och jag körde byggkommandot igen för att bekräfta att den är borta - det
enda som återstår att se i din terminal är typsnittshämtningen, som är en
känd begränsning i den här sandlådan, inte en riktig bugg.

## Rättat: `redirect()` kraschade hela produktionsbygget

Det du hittade var en riktig, allvarlig bugg - inte en sandlåde-artefakt.
`redirect()` från språksystemet kräver ett objekt med explicit `locale`
(`redirect({ href: "/login", locale })`), inte bara en text-sträng
(`redirect("/login")`) som `Link` och `useRouter` tillåter. Alla åtta
filer som använde det gamla, felaktiga sättet är fixade - dashboard,
bläddra, matchningar, chatt, profil, "vem gillar dig", och adminpanelen.

Två av dem (`profile/page.tsx`, `likes/page.tsx`) importerade dessutom
`redirect` från fel ställe (vanliga Next.js-versionen istället för
språkversionen) - skulle ha skickat dig till `/login` istället för
`/sv/login` eller `/en/login`. Fixat samtidigt.

Jag verifierade detta genom att köra TypeScript-kompilatorn direkt
(`npx tsc --noEmit`), som gör samma typkontroll som `next build` men utan
att behöva hämta typsnitt - så jag kunde bekräfta att alla `redirect()`-
fel är borta utan att blockeras av sandlådans nätverksbegränsning.

## Tre rättelser

- **"N"-ikonen**: det var Next.js egen inbyggda utvecklarindikator (inte
  något jag byggt), som enligt Next.js dokumentation inte ska synas i
  `npm run start`. Avstängd helt nu oavsett läge (`devIndicators: false`
  i `next.config.ts`).
- **Cookie-inställningar**: "Hantera" öppnar nu en riktig panel med ett
  av/på-reglage för "Nödvändiga" - visuellt en riktig växel, men låst på
  och inaktiverad eftersom det inte finns något att stänga av. Ärligt,
  men ser ut och känns som det bekanta mönstret.
- **Installera appen**: går inte längre att stänga bort med ett kryss.
  Den ligger kvar tills appen faktiskt installeras.

## Cookie-panelen har nu en riktig andra kategori

"Hantera" visar nu två rader: **Nödvändiga** (låst på, som innan) och
**Analys** (en riktig, verksam växel - stänger genuint av
besöksräkningen om man slår av den, inget påhitt). Sparas i en egen
cookie (`velvetine_analytics_consent`), läses av räknaren innan den
skickar något.

## Riktig analys-cookie (inte bara en inställning)

Bytte ut den tidigare cookie-fria dagshash-lösningen mot en riktig,
vanlig cookie (`velvetine_visitor_id`) - precis som du bad om. Den sätts
bara om man slår på "Analys" i cookie-rutan (avstängd som standard,
äkta opt-in eftersom det nu är en riktig identifierare), och tas bort
direkt om man stänger av den igen. Policysidorna (`/cookies` och
`/integritetspolicy`) är uppdaterade för att beskriva den korrekt - fyra
cookies totalt nu: tre nödvändiga (session, samtyckesnotis,
analys-valet) och en valfri (besökar-ID:t self).

## Två rättelser till cookie-panelen

- Analys-beskrivningen sa fortfarande "no cookie" trots att den nu
  faktiskt sätter en - texten var bara inte uppdaterad när cookien blev
  på riktigt. Rättat.
- "Fullständig cookiepolicy"-länken renderas nu via en portal (samma
  teknik som löste bildpopupen tidigare), ifall den satt fast bakom
  något. Stänger dessutom panelen automatiskt när man klickar den.

## Vad ett komplett cookie-system faktiskt behöver

Din fråga fick mig att granska allt på riktigt. Så här ser det ut nu:

**Varje cookie behöver tekniskt:** ett namn, ett värde, en livslängd
(`max-age`), en `path` (vi använder `/` överallt), `SameSite=Lax` (skydd
mot enkel CSRF), och `Secure` i produktion (skickas bara över HTTPS).

**Vad jag hittade och fixade:** tre av våra fyra cookies
(samtyckesnotisen, analys-valet, besökar-ID:t) saknade `Secure`-flaggan i
produktion - en riktig, om än mindre allvarlig, säkerhetslucka. Fixad via
en gemensam hjälpfunktion så alla tre sätts likadant och rätt.

**En cookie jag glömt dokumentera:** `NEXT_LOCALE` - språksystemet sätter
den automatiskt när man byter språk, helt utanför min kod. Fanns hela
tiden, bara inte nämnd på `/cookies` förrän nu. Konfigurerad explicit med
samma säkerhetsinställningar som resten.

**Totalt nu: fyra cookies** - tre nödvändiga (session, samtyckesnotis,
analys-val) plus språkvalet, och en valfri (besökar-ID, kräver aktivt
samtycke). Inget annat sätts av oss. Den dagen Stripe kopplas in för
betalningar sätter de sina egna cookies för bedrägeriskydd - då
uppdaterar vi listan igen.

## Nakenbildsfilter

Alla bilder (profilbilder och skrytprylar) granskas nu automatiskt av
OpenAI innan de sparas - sexuellt innehåll avvisas direkt, bilden
raderas från lagringen och sparas aldrig i databasen. Kräver
`OPENAI_API_KEY` (samma som rapportgranskningen redan använder). Om
nyckeln saknas skriver servern ut en tydlig varning i terminalen varje
gång ett foto laddas upp - går inte att missa av misstag.

## Installations-knappen ombyggd

Ligger nu som en fast rad högst upp på sidan (samma stil som
cookie-raden i botten), inte en flytande ruta - permanent del av sidan,
inte en notis man kan uppfatta som tillfällig.

## Genomgång - fyra saker värda att åtgärda innan lansering

1. **Ingen e-postverifiering vid registrering.** Man kan registrera sig
   med vilken e-postadress som helst, felstavad eller inte, utan att
   någonsin behöva bekräfta den. Bör fixas innan skarpt läge.
2. **Dataportabilitet är utlovad men finns inte.** Integritetspolicyn
   säger att medlemmar kan "få ut sina uppgifter i ett strukturerat
   format" (GDPR-rättighet) - men det finns ingen knapp eller funktion
   som faktiskt gör det. Utlovat men inte byggt.
3. **Ingen hastighetsbegränsning** på inloggning, registrering eller
   rapporter - någon skulle kunna testa lösenord i snabb följd eller
   spamma rapporter utan att något stoppar dem.
4. **Bläddra-flödet hämtar bara en batch (20 profiler)** och laddar
   aldrig fler automatiskt - fungerar nu med få användare men blir ett
   problem när fler går med.

## Bildramar per nivå + filterjustering

Profilbilden får nu en färgad ram som matchar din nivås badge-färg -
tunnare/dovare på Ingång, tjockare med en guldglöd på Inre kretsen. Syns
i bläddra-flödet och i din egen förhandsgranskning.

Nakenbildsfiltrets tröskel höjd (0.3 → 0.7) efter din fråga - baddräkt
och liknande ska gå igenom obehindrat, bara riktig nakenhet/pornografi
ska stoppas. Ingen lag kräver att baddräktsbilder blockeras, så det var
mitt filter som var för nitiskt, inte ett juridiskt krav. Denna siffra
kan behöva justeras ytterligare efter att du testat med riktiga bilder.

## Dolda matchningspreferenser

Nytt på `/profile`: kroppsform och hårfärg som vanliga, synliga
profilfält (som längd/yrke redan är), plus en helt separat sektion
"Sökpreferenser" - önskad längd, kroppsform, hårfärg hos den man letar
efter. Den sektionen är tydligt märkt som privat och syns aldrig för
någon annan, inte ens den man matchar med.

Bläddra-flödet använder detta för att **sortera** (inte filtrera) - de
som bäst matchar dina dolda preferenser visas först, men ingen
utesluts helt för att inte matcha. Hämtar nu en större pool bakom
kulisserna (upp till 150) innan den sorterar och visar de 20 bästa.

Ursprungsland/etnicitet är medvetet **inte** med, efter research om
Grindrs etnicitetsfilter-debatt och GDPR:s krav på separat samtycke för
den typen av uppgift (samma kategori som kön/läggning) - din egen
bedömning var att hoppa över det om det krockar med regler.

## Plats (stad/land) — riktig miss rättad

Databasen hade fälten sedan starten, men inget gränssnitt använde dem.
Nu på `/profile`: stad (fritext) och land (lista med ~20 länder plus
"Annat"). Visas tydligt under namnet i bläddra-flödet - helt vanlig
geografisk information, inte en etnicitetsfråga. Samma land som dig ger
extra poäng i sorteringen (samma mjuka rankning som längd/kroppsform/
hårfärg) - realistiskt kan man ju bara dejta någon man faktiskt kan
träffa.

## E-postverifiering (Fas 1, punkt 1)

Vid registrering skickas nu en verifieringslänk (samma terminal-fallback
som lösenordsåterställning om `RESEND_API_KEY` saknas). Kontot fungerar
direkt efter registrering, men **bläddra-flödet är låst** tills
e-posten är bekräftad - en tydlig ruta med "skicka länken igen" visas
istället för profiler. En mjukare påminnelse (inte blockerande) syns
även på dashboard tills det är klart.

Länken går till `/verify-email?token=...`, giltig i 24 timmar.

## Egen port — löser återkommande krockar permanent

Velvetine körs nu på **port 3010** istället för standard 3000
(`localhost:3010`), inte 3000 längre. Orsaken: du testar troligen
Farvyo, Kelvox och Velvetine alla på samma port, och en service worker
registrerad av ETT projekt stör sedan NÄSTA projekt som körs där -
oavsett vilket. Det här är grundorsaken till flera av krångel vi haft
(N-ikonen, gammal cachad kod, och nu olästa-meddelanden-anrop som inte
ens finns i Velvetine). Med en egen fast port kan det inte hända igen.

## Kön och "söker" går nu att ändra

Ny sektion högst upp på `/profile` — kunde tidigare bara sättas vid
registrering, ingen väg att ändra det efteråt. Nu redigerbart precis
som resten av profilen. Kräver minst ett val kvar under "söker" (kan
inte spara tomt, då skulle ingen någonsin matcha dig).

## Olästa-meddelanden och nya gillningar (byggt medan du sov)

Riktiga notiser (push, "du har ett nytt meddelande" utanför webbläsaren)
finns fortfarande inte - det kräver mer infrastruktur (webbläsartillstånd,
en separat sändningstjänst) och är ett eget, större jobb om du vill ha
det senare.

Det som **är** byggt nu, i appen:

- En guldpunkt i matchningslistan visar vilka konversationer som har
  olästa meddelanden, eller är helt nya matchningar du aldrig öppnat.
- En liten räknare (bubbla) vid "Matchningar" och "Vem gillar dig" i
  headern, på både dashboard och bläddra-sidan - visar hur många som
  väntar på dig.
- Räknaren nollställs automatiskt när du faktiskt öppnar chatten eller
  besöker "Vem gillar dig"-sidan.

Ingen ny miljövariabel, men **schemaändring** krävs (se nedan).

## Push-notiser (riktiga, inget tredjepartskonto)

Till skillnad från Resend/Stripe/OpenAI behövs **inget konto** för det
här - bara ett eget nyckelpar (VAPID) som redan är genererat åt dig.
Lägg till dessa två rader i `.env`:

```
VAPID_PUBLIC_KEY=BKoyZDLlAh3_ciexW3_SZeRAEtVqBPjHoCgMWqGkv01Ik7oZJpjyjsGqsKz8okfXx9pPBM6-qfXCQJ56tKURpzA
VAPID_PRIVATE_KEY=1-6ehnAiCWR3tZBjtPRQqlA44JfitMPcJrgVyGJ3mrw
```

En knapp "Aktivera" finns nu på dashboard. Skickar en riktig
push-notis vid ny matchning och nytt meddelande, med länk direkt till
rätt konversation.

**Viktigt att veta:**
- Fungerar bara i **produktionsläge** (`npm run build && npm run start`),
  inte `npm run dev` - service workern (som krävs för push) registreras
  medvetet bara i produktion, av samma anledning som install-rutan.
- På **iPhone** fungerar push bara om appen redan installerats på
  hemskärmen - Safari tillåter det inte annars. Det är en Apple-regel,
  inget vi kan kringgå.
- Notistexten är på svenska oavsett vilket språk mottagaren använder -
  vi sparar inget språkval per person än. Kan byggas ut senare om det
  behövs.

## E-postnotiser (samma händelser, som backup till push)

Ny matchning och nytt meddelande mejlas nu också, inte bara push -
samma Resend-mönster som resten (terminal-utskrift om `RESEND_API_KEY`
saknas). Meddelande-mejl skickas **bara för det första olästa
meddelandet** sedan mottagaren senast öppnade tråden - annars hade en
aktiv konversation med många snabba svar genererat ett mejl per
meddelande, vilket hade varit rent spam.

## Admin-länk i menyn

En "Admin"-länk syns nu i menyn på dashboard och bläddra-sidan - men
bara om kontot faktiskt har admin-rättigheter (`isAdmin` i databasen).
Vanliga medlemmar ser den aldrig. Går att hoppa fram och tillbaka mellan
medlemsvyn och adminpanelen ("Visa medlemssidan →" fanns redan där).

## Stripe (betalning) — testläge, ingen domän behövs

Hela betalflödet: köp av nivå, uppgradering, uppsägning. Byggt och
testbart helt i Stripes testläge - inga riktiga pengar, inget behov av
företagsuppgifter eller domän för det här steget.

**Sätt upp:**

1. Skapa ett gratis Stripe-konto på stripe.com om du inte redan har ett
2. Hämta din **testnyckel** (Developers → API keys → "Secret key",
   börjar med `sk_test_`), lägg i `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. Skapa produkter/priser för de 5 nivåerna automatiskt:
   ```powershell
   npm run stripe:setup
   ```
   (säker att köra flera gånger - hoppar över nivåer som redan har ett pris)
4. **Webhook för lokal testning** - installera Stripe CLI
   (https://docs.stripe.com/stripe-cli), sedan:
   ```powershell
   stripe login
   stripe listen --forward-to localhost:3010/api/stripe/webhook
   ```
   Den skriver ut en `whsec_...`-nyckel - lägg den i `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   Låt det kommandot fortsätta köra i ett eget terminalfönster medan du testar.

**Testa:** logga in, gå till dashboard → "Se nivåer och priser" → välj
en nivå → Stripes testkassa öppnas → kortnummer `4242 4242 4242 4242`,
valfritt framtida datum, valfri CVC → efter betalning ska din nivå
uppdateras automatiskt på dashboard (webhooken gör det). "Hantera
medlemskap" öppnar Stripes egen sida för uppsägning/betalningsmetod -
inget vi behövt bygga själva där.

**Inför skarp lansering:** byt `sk_test_...` mot `sk_live_...`, kör
`npm run stripe:setup` igen (skapar riktiga produkter), sätt upp en
riktig webhook-endpoint i Stripes dashboard (pekar mot er riktiga
domän eller Vercel-adress) istället för CLI-vidarebefordran, och
aktivera kontot för skarpt läge (kräver företagsuppgifter + en
fungerande webbadress - Vercels gratisadress duger om ni inte hunnit
skaffa domänen än).

## Stripe Tax — vet vilket land kunden köper från

Betalflödet räknar nu automatiskt ut kundens land och rätt momssats
(EU-krav: minst två samstämmiga bevis, t.ex. faktureringsadress + kortets
utgivarland - Stripe sköter den bedömningen åt oss). Kostar en liten
summa per transaktion hos Stripe.

**Två saker du behöver göra i Stripes dashboard** (inte kod):
1. Gå till **Products**, sätt en skattekategori (t.ex. "Digital
   services"/liknande) på varje nivå-produkt som `npm run stripe:setup`
   skapade - annars vet Stripe Tax inte vilken sorts vara/tjänst det är.
2. Under **Tax → Registrations**, registrera er för momsuppbörd i de
   länder ni faktiskt säljer i. Stripe räknar rätt skatt, men det är ni
   som behöver vara registrerade för att få ta ut den, precis som med
   vanlig svensk moms.

## Dataportabilitet — utlovat, nu byggt

Ny knapp längst ner på `/profile`: "Ladda ner dina uppgifter" - laddar
ner en JSON-fil med allt personen själv lagt in (profil, bilder,
svar, intressen, skrytprylar, matchningar, egna meddelanden, egna
svep, egna rapporter). Innehåller **inte** andra personers meddelanden
eller rapporter mot en själv - bara det GDPR faktiskt räknar som "din
egen" data.

## Rättat: ansökan om höga nivåer gick faktiskt inte att skicka in

Bra fångst - "Apply for this tier" ledde bara till dashboard, ingen
riktig ansökan gick att skicka. Adminkön för att granska ansökningar
fanns, men aldrig sättet att faktiskt skapa en. Fixat: på
`/upgrade` går det nu att klicka fram ett formulär, skriva en valfri
kommentar, och skicka in — syns direkt i adminpanelens ansökningskö.
Status (väntar/nekad) visas tydligt, och en nekad ansökan går att
skicka in igen.

## Ansökningar till exklusiva nivåer — godkänns nu direkt

Efter ditt beslut: betalning är den egentliga spärren, inte en
subjektiv bedömning av en textruta. Ansökningar godkänns nu
**automatiskt direkt** vid inskick - såvida inte kontot är avstängt
eller bannat, då nekas den istället. Adminkön för manuell granskning
finns kvar (om du någon gång vill använda den), men ska normalt vara
tom eftersom inget längre fastnar där.

## Rättat: riktig bugg som kunde dubbeldebitera vid nivåbyte

Du hittade den innan den blev ett problem på riktigt. Om någon med en
aktiv prenumeration bytte nivå startade koden tidigare en **ny**
prenumeration istället för att ändra den befintliga - hade betytt att
både gamla och nya nivån debiterades samtidigt. Fixat: ett nivåbyte
uppdaterar nu samma prenumeration (Stripe räknar ut mellanskillnaden
automatiskt), aldrig en till.

## Misslyckad betalning syns nu båda hållen

Går en betalning inte igenom (kortet nekas, går ut osv.) - syns det nu
tydligt:
- **Hos medlemmen**: en ruta på dashboard som säger att betalningen
  misslyckades, med en knapp som går direkt till Stripes sida för att
  uppdatera betalningsmetod.
- **Hos dig**: en ny kolumn "Betalning" i adminpanelens medlemslista,
  visar "Väntar på betalning" tydligt märkt.

## Hastighetsbegränsning (sista säkerhetspunkten)

Databas-baserad (inte i minnet) - fungerar korrekt även när sajten
driftsätts på Vercel med flera serverinstanser, till skillnad från en
enkel minnesräknare som bara hade fungerat lokalt.

- **Inloggning**: max 10 försök per 15 minuter per IP-adress
- **Registrering**: max 5 per timme per IP-adress
- **Rapporter**: max 20 per dygn per konto
- **Glömt lösenord**: max 5 per timme per IP (låg inte med i din lista,
  men samma typ av risk - mailbombning via återställningsmejl)

Extra bugg hittad och fixad på samma gång: lösenordsåterställnings-
länken saknade språkprefixet (`/sv/`) som alla andra länkar redan har.

## Prioriterad synlighet — sista nivåförmånen

Högre nivå ger nu högre placering i andras bläddra-flöde, automatiskt -
inget att aktivera, gäller alla direkt beroende på nivå. Viktad
kraftigt (upp till +10 poäng vid Inre kretsen) så det faktiskt märks,
inte bara en liten knuff bland de andra sorteringssignalerna (längd/
kroppsform/hårfärg/land). Alla fyra ursprungliga nivåförmåner är nu
byggda: vem gillar dig, inkognito, auto-blur, och nu prioriterad
synlighet.

## Auto-blur döljer nu mycket mer

Efter din feedback: en profil med högre nivå än dig visar nu bara namn,
ålder och nivåmärke - plats, bio, längd/kroppsform/hårfärg/vad-de-söker,
profilsvar, och skrytprylarna (inklusive deras bilder) är alla dolda
tills du uppgraderar. Tidigare var det bara själva huvudbilden som
blurrades, resten syntes - det kändes som för mycket enligt dig.

## Auto-blur släpper när den höga nivån hör av sig

Ny regel: om en person med högre nivå redan gillat dig, visas de
**aldrig** blurrade i ditt bläddra-flöde - oavsett om ni matchat än
eller inte. Att de valt att höra av sig är själva upplåsningen. Blur
gäller bara personer som inte gjort det ännu.

Inte med i den här omgången: "Vem gillar dig"-listan visar fortfarande
bara namn och nivå, inga bilder eller övrig profil - det är ett
separat, äldre gap i den sidan, inte en konsekvens av blur-regeln (den
har aldrig blurrat något där). Säg till om du vill att den sidan visar
fullständiga profiler också.

## Rättat: två-klicks-förvirringen vid ansökan

Efter din feedback: sedan godkännande redan sker direkt fanns ingen
anledning att kräva ett andra, separat klick på "Välj" efteråt - det
var lätt att missa att knappen bytt utseende. Nu går det automatiskt
vidare till Stripes betalsida direkt efter godkänd ansökan, inget extra
klick behövs.

**Inte byggt än:** en tydlig "väntar på betalning"-status om någon
startar men aldrig slutför betalningen (stänger fliken mitt i Stripes
kassa). Det kräver antingen att vänta på Stripes egen
utgångshantering (tar upp till 24 timmar) eller ett separat
spårningssystem - ett större, eget jobb om du vill ha det. Säg till.

## Adminpanelen visar nu ansökningshistorik

Bra fångst — eftersom ansökningar löses direkt syntes de aldrig i kön,
och det såg ut som att inget hänt. Ansökningar-sidan i admin har nu en
ny historiktabell längre ner som visar **alla** avgjorda ansökningar
(godkänd/nekad, när, av vem - "Automatiskt" för de som gick igenom av
sig själva). Kön högst upp finns kvar för de sällsynta fallen som
faktiskt behöver manuell granskning (t.ex. avstängda konton).

## Manuell nivå-tilldelning i admin (för testning utan Stripe)

Ny dropdown i "Nivå"-kolumnen på Medlemmar-sidan — sätt eller ändra
vilken nivå som helst direkt på ett konto, helt utan att gå via
betalning. Löser både "testa varje nivå" och "byt till lägre nivå".

## Tydligare visuella statussymboler

Utöver den färgade fotoramen finns nu en symbol-badge i hörnet av
profilbilden, synlig för alla (inte bara höga nivåer som tittar på
varandra) - samma symbol syns även i nivålistan på startsidan:

- Ingång: •
- Utvald: ✦
- Reserverad: ✦✦
- Förstklassig: ♛
- Inre kretsen: 💎 (den "diamantram" du efterfrågade, fast som badge
  istället för att ersätta ramen - båda syns nu tillsammans)

## Nivåförmåner omfördelade — varje nivå ger nu något eget

Efter din feedback om att Ingång praktiskt taget gav ingenting:

- **Ingång** (nivå 1): **Vem gillar dig** — flyttad ner hit, den lägsta
  betalnivån ger nu en riktig, konkret anledning att ha betalt alls.
- **Utvald** (nivå 2): **Inkognitoläge** — flyttad ner ett steg.
- **Reserverad** (nivå 3): helt ny förmån — **skarpa sökfilter**. Dina
  dolda sökpreferenser (längd/kroppsform/hårfärg) filtrerar nu bort
  icke-matchningar helt istället för att bara sortera ner dem. Faller
  tillbaka på hela flödet om filtret skulle ge noll träffar, så man
  aldrig ser ett tomt flöde.
- **Förstklassig/Inre kretsen**: oförändrat, kräver ansökan + starkast
  visuell status.

## Fyra nya, riktiga nivåförmåner

- **Boost** (Utvald+, en gång/dygn): en knapp på dashboard som sätter
  dig överst i allas flöde i 30 minuter - aktiv, inte bara passiv.
- **Skarpa sökfilter** (Reserverad+): redan byggt förra omgången.
- **Läskvitto** (Reserverad+): i chatten ser du "Läst"/"Skickat" under
  dina egna meddelanden.
- **Profilbesökare** (Förstklassig+): ny sida `/visitors` - visar ALLA
  som sett din profil, inte bara de som gillat den (till skillnad från
  "Vem gillar dig" som bara visar gillningar).
- **Meddela innan matchning** (Förstklassig+): en knapp på bläddra-
  kortet - skicka ett första meddelande direkt utan att vänta på
  ömsesidig gillning, skapar matchningen automatiskt.

**Inte byggt:** butiken med köpbara ramar/utseenden/skryt-märken - ett
eget, betydligt större system (köpflöde + ägandeskap + inbyggnad i hur
profil/chatt ser ut). Säg till när du vill ta det som ett eget projekt.

## Chatten uppdaterar sig själv nu, och stödjer bilder

- **Automatisk uppdatering**: chatten hämtar nya meddelanden var 3:e
  sekund själv - ingen "Uppdatera"-knapp behövs längre, borttagen.
- **Bilder**: 📷-knappen bredvid textfältet - samma nakenbildsfilter
  som profilbilder körs på varje skickad bild.
- **Rullande radering**: meddelanden äldre än 90 dagar raderas
  automatiskt (kollas när en tråd öppnas) - ingen chatt-historik
  sparas längre än så, vilket är precis det du bad om för att slippa
  fundera på lagringslagar. Siffran (90 dagar) är en enda konstant i
  koden om du vill ändra den.

**Videosamtal:** inte byggt - det är ett eget, betydligt större
projekt (kräver antingen egen infrastruktur för att koppla samman
samtal, eller en betald tredjepartstjänst). Säg till när du vill
diskutera hur vi skulle bygga det, så vi väljer rätt väg innan vi
sätter igång.

## Policysidorna uppdaterade med betalningsvillkor

Villkor har nu ett helt stycke om: var man ser vad som ingår (länkar
till nivålistan istället för att upprepa priser som kan bli
inaktuella), att nivåbyten aldrig dubbeldebiterar, att allt hanteras
via Stripes säkra sida, och återbetalningspolicy. Integritetspolicyn
nämner nu den nya 90-dagarsraderingen av chattmeddelanden konkret.

## Butiken — köpbara ramar, klar

Fem ramar seedade (Roséguld, Platina, Smaragd, Safir, Diamant), olika
stil och pris. Engångsköp via Stripe, inget abonnemang. Ny sida
`/store`, länk från dashboard. Köpt ram visas istället för
nivå-ramen, både i din egen förhandsgranskning och för andra i
bläddra-flödet.

**Sätt upp** (utöver vanliga Stripe-nycklar som redan finns):
```powershell
npm run stripe:setup-store
```
Skapar Stripe-produkter för alla fem ramar automatiskt. Säker att köra
om, hoppar över redan skapade.

**Videosamtal:** medvetet inte byggt, efter din egen bedömning om den
löpande kostnaden. Kan tas upp igen senare om ni ändrar er.

**Viktigt att veta:** min sandlåda kunde inte köra en fullständig
`prisma generate` för butiks-modellerna (nätverksbegränsning på min
sida, inget du behöver bry dig om) - jag har granskat koden manuellt
mot schemat, men var extra uppmärksam första gången du testar
butiken och säg till direkt om något inte fungerar som väntat.

## Foto-/identitetsverifiering — sista trust & safety-biten

Ny sektion högst upp på `/profile`: ladda upp en selfie. Går genom
samma nakenbildsfilter som alla andra bilder, hamnar sedan i en ny
adminsida (`/admin/verifications`) för manuell granskning - selfien
visas sida vid sida med personens befintliga profilbilder, ni
godkänner eller nekar för hand. Ingen automatisk ansiktsmatchning
(inte tillräckligt tillförlitligt för att lita på blint) - mänsklig
bedömning, precis som Tinder/Bumble gör det.

Godkänd verifiering ger en guldig bock (✓) bredvid namnet, synlig i
bläddra-flödet, "Vem gillar dig", "Profilbesökare", och din egen
förhandsgranskning.

## "Vem gillar dig" och "Profilbesökare" visar nu riktiga foton

Båda sidorna visade tidigare bara en bokstav i en cirkel. Nu: riktig
profilbild om personen har en, annars bokstaven som innan. Bock för
verifierade profiler syns här också.

## Komplett checklista: driftsättning, domän, mejl

Ordningen spelar roll - följ den så här, punkt för punkt.

### 1. Driftsätt till Vercel nu (kräver ingen domän)

1. Skapa ett gratiskonto på **vercel.com** om du inte redan har ett
2. Antingen: pusha koden till ett GitHub-repo och koppla det i Vercels
   dashboard ("Import Project") - eller kör `vercel --prod` från
   projektmappen om du har Vercel CLI installerat (samma sätt som
   Farvyo driftsätts)
3. **Viktigast:** lägg in ALLA dessa miljövariabler i Vercels projekt-
   inställningar (Settings → Environment Variables) - exakt samma
   namn och värden som i din lokala `.env`:
   ```
   DATABASE_URL
   JWT_SECRET
   BLOB_READ_WRITE_TOKEN
   OPENAI_API_KEY
   OPENAI_MODEL
   RESEND_API_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY
   ```
4. Deploya - du får en gratis adress typ `velvetine.vercel.app`, redan
   riktigt "live" och testbar av vem som helst

### 2. Köp domänen (du gör detta steget, se tidigare svar)

### 3. Koppla domänen till Vercel

1. Vercel-projektet → **Settings → Domains** → lägg till din domän
2. Vercel visar exakt vilka DNS-poster som behövs (oftast en A-post
   eller CNAME)
3. Lägg in dem i Cloudflare under domänens DNS-inställningar
4. Vänta någon timme på att DNS sprider sig - Vercel visar en grön
   bock när det är klart

### 4. Verifiera domänen i Resend

1. Resend-dashboarden → **Domains** → Add Domain → skriv in din nya domän
2. Resend visar SPF/DKIM-poster att lägga in - samma sak, in i
   Cloudflares DNS
3. När Resend visar "Verified": mejl kan nu skickas från din riktiga
   adress istället för test-läge

### 5. Uppdatera avsändaradressen i koden

Om domänen blev exakt `velvetine.app` behövs **ingen ändring** - `FROM_ADDRESS`
i `src/lib/email.ts` är redan satt till `noreply@velvetine.app`. Blev det
en annan domän, säg till så uppdaterar jag den raden.

### 6. Support-mejl (samma mönster som Farvyos info@)

1. Cloudflare → domänen → **Email Routing**
2. Skapa en regel: `support@dindomän.se` → vidarebefordra till din Gmail
3. Uppdatera platshållartexten `[add C it all contact address]` i
   policysidorna med den riktiga adressen - säg till så fixar jag det

### 7. Peka om Stripe-webhooken från test-läge till skarpt

Just nu använder du Stripe CLI lokalt för webhooks. När sajten är
live:
1. Stripe Dashboard → **Developers → Webhooks** → Add endpoint
2. URL: `https://dindomän.se/api/stripe/webhook`
3. Kopiera den nya signeringsnyckeln till `STRIPE_WEBHOOK_SECRET` i
   Vercels miljövariabler (inte din lokala `.env` - det är för
   produktion)

## Förberett ytterligare för driftsättning

Tre saker klara utan att behöva dina inloggningar:

- **`.env.example` uppdaterad** - var utdaterad, saknade VAPID-nycklarna
  helt och hade Stripe/Blob felaktigt kommenterade som "inte behövs
  än". Nu en komplett, korrekt lista - exakt samma variabler du klistrar
  in i Vercels miljövariabler.
- **`vercel.json` tillagd** - låser serverfunktionerna till Stockholm
  (`arn1`), samma region som er Supabase-databas. Utan den hade Vercel
  som standard kört i USA, vilket lagt på onödig latens på varje
  databasfråga (och känns bättre ur ett EU-dataperspektiv också).
- Dubbelkollat hela koden för hårdkodade `localhost`-referenser - inga
  hittades, alla länkar byggs dynamiskt utifrån var sajten faktiskt körs.

Allt annat (själva driftsättningen, domänköpet, DNS-posterna) kräver
dina inloggningar och kan inte förberedas mer än vad checklistan ovan
redan gör.

## Ingen lag kräver längre chattlagring — men en verklig förbättring

Bekräftat: inget lagkrav tvingar oss att spara chattmeddelanden längre
(EU:s gamla datalagringsdirektiv gällde teleoperatörer, ogiltigförklarat
2014 - och GDPR kräver snarare motsatsen, lagringsminimering). 90-dagars
raderingen är juridiskt helt rätt håll.

Men en verklig förbättring gjord ändå: raderingen **pausas** nu helt
för en konversation om någon av parterna har en **öppen** rapport
(status "Väntande") mot sig - annars hade bevis kunnat försvinna mitt i
en pågående utredning. Återupptas automatiskt när rapporten är avgjord
(godkänd eller avvisad).

## Nakenbildsfiltret uppdelat: privat chatt vs. publikt

Efter din tydliga gräns: **privat chatt mellan två som redan matchat**
är nu obegränsad vad gäller nakenhet/sexuellt innehåll mellan vuxna -
helt upp till dem. **Profilbilder och skrytprylar** (publikt, syns för
alla) förblir som förut - baddräkt går igenom, riktig nakenhet stoppas.

Barn-relaterat innehåll (misstänkt CSAM) blockeras **alltid**, i båda
sammanhangen, utan undantag - den delen av filtret rörs aldrig.

## Säkerhetsflaggor — permanent spår + automatisk avstängning

Om filtret misstänker material som rör minderåriga: kontot **stängs av
automatiskt och direkt**, och en permanent post sparas i en ny
adminsida (`/admin/safety-flags`) - försvinner aldrig i en tillfällig
serverlogg. Bilden visas **inte** i admin (medvetet), bara metadata
(vem, när, var) plus URL:en för den dagen ni faktiskt behöver
rapportera.

**Viktigt att göra, gratis, ingen jurist behövs:** registrera er som
"Electronic Service Provider" hos NCMEC (ncmec.org) för att kunna
skicka riktiga rapporter till rätt myndighet. Det är den enda pusselbit
jag inte kan bygga åt er - resten är klart och väntar på den
registreringen.

## Säkerhetsflaggor: klarmarkera och auto-radering

Ny knapp i `/admin/safety-flags`: **"Klarmarkera (rapporterad/avfärdad)"**
- klicka den när du agerat (skickat till NCMEC, eller bedömt att det
var en felaktig flaggning). Posten raderas automatiskt 30 dagar efter
det, så inget ligger kvar och tar plats i onödan. Oklarmarkerade
flaggor raderas **aldrig** automatiskt - bara sådant du faktiskt tagit
ställning till.

Samma gräns som innan gäller fortfarande: det finns inget sätt att
automatiskt skicka bilden vidare till NCMEC härifrån - det steget görs
av dig, genom deras egna, godkända rapporteringskanal, en gång ni är
registrerade.

## Rättat: sparfristen efter klarmarkering var för kort

Din fråga fick mig att dubbelkolla, och 30 dagar var faktiskt fel -
amerikansk lag (2024 års REPORT Act, del av 18 U.S.C. § 2258A) säger
att en genomförd rapport till NCMEC ska behandlas som en begäran att
spara innehållet i **ett år**, inte 90 dagar som det stod tidigare i
lagen. Ändrat till 365 dagar - inte en gissning från mig, utan samma
tidsram lagen själv anser rimlig för att polisen ska hinna återkomma
vid behov. Du behöver alltså inte själv avgöra "är detta klart" - följ
bara den här fristen, så är du i linje med vad som faktiskt förväntas.

## Klicka för att förstora bilder i chatten

Bilder i chatten går nu att klicka på för att se dem i fullskärm -
samma lösning som redan användes för skrytprylarnas bilder på
profilen (så samma tidigare lösta clipping-buggar dyker inte upp här).

## Publika sidor för priser och butiken

Två nya sidor, ingen inloggning krävs, länkade i sidfoten precis som
Villkor/Cookies:

- **`/priser`** — alla fem nivåer med pris OCH en tydlig lista över vad
  varje nivå faktiskt ger (inte bara ett pristagg).
- **`/butik-info`** — vad butiken är, med riktiga priser hämtade från
  databasen, en "Logga in för att köpa"-länk.

Båda hämtar riktig data från databasen (inte hårdkodade priser), så de
kan aldrig bli inaktuella om priser ändras senare.

## Ny profilsida — löser "kan inte hitta sakerna"

Ny sida `/u/[userId]` visar någons fullständiga profil (samma kort som
i bläddra-flödet) med rätt knappar beroende på läge:

- **Redan matchade** → en tydlig "Öppna chatt"-knapp
- **Inte matchade** → Gilla/Nej tack-knappar
- **Din nivå är Förstklassig eller högre** → "Skicka meddelande direkt"
  finns här också, inte bara i bläddra-flödet

Klickbart från tre ställen som tidigare bara visade namn utan länk:
"Vem gillar dig", "Profilbesökare", och nu även **namnet i chattens
header** (för att se hela profilen på någon du redan chattar med).
Matchningslistan går fortfarande direkt till chatten som innan - det
är rätt beteende där.

## Namnbyte: Noctura → Velvetine

Hela kodbasen genomsökt och uppdaterad - 26 filer, allt från
e-postmallar, policysidor, cookienamn, PWA-manifest, service worker,
till `package.json`. Domänen i koden är satt till `velvetine.app`
(den du bekräftade var ledig) - byt bara `FROM_ADDRESS` i
`src/lib/email.ts` om ni landar på en annan ändelse.

**Tre saker jag inte kan fixa åt dig, kräver din åtgärd:**

1. **Om du redan kört `npm run stripe:setup` eller `stripe:setup-store`**
   med det gamla namnet - de Stripe-produkterna heter fortfarande
   "Noctura – ..." i Stripe-dashboarden, eftersom skripten hoppar över
   redan skapade produkter. Byt namn manuellt i Stripe Dashboard →
   Products, eller radera och kör skripten igen om du hellre vill
   börja om helt rent.
2. **Cookienamnen ändrades** (`noctura_session` → `velvetine_session`
   osv.) - gamla cookies från tidigare tester ignoreras bara, inget
   som går sönder, men värt att veta om du undrar varför inloggningen
   "glömts" efter uppdateringen.
3. **Mappen på din dator heter fortfarande `noctura`** - helt kosmetiskt,
   påverkar inget, men byt gärna namn på den själv om du vill ha
   konsekvens.

## Nu kan du faktiskt granska en säkerhetsflaggning

Efter din helt rimliga invändning: att aldrig kunna se bilden gjorde
det omöjligt att skilja en uppenbar felflaggning (t.ex. någon i
baddräkt) från något som faktiskt behöver rapporteras. Riktiga
plattformar (Meta, Google) låter faktiskt utbildade granskare se
flaggat innehåll som en normal del av processen, och amerikansk lag
(REPORT Act) ger uttryckligt rättsligt skydd för leverantörer som
granskar och rapporterar sådant material i god tro.

Nu: en **"Visa bild för granskning"**-knapp per flaggning, dold som
standard, kräver ett extra bekräftelseklick innan bilden faktiskt
visas ("Ja, visa" efter en tydlig varning) - inte casual, men inte
omöjlig heller. Går att dölja igen direkt. URL:en för rapportering
finns kvar som referens under bilden.

## Bakåtknapp på Priser/Butik-info, och Butiken syns nu i huvudmenyn

- `/priser` och `/butik-info` hade en egen, enklare header utan
  bakåtlänk - bytt ut mot samma `AppHeader` som resten av sajten
  använder, så en "← Tillbaka"-länk finns nu där också.
- **"Butiken"** syns nu som en egen länk i huvudmenyn på dashboard och
  bläddra-sidan, bredvid Matchningar/Vem gillar dig/Profilbesökare -
  inte bara en liten textlänk under nivå-sektionen som innan.

## Manifestet var aldrig kopplat in — löser installationsproblemet

Hittade det: `manifest.ts`-filen fanns och genererade rätt data, men
sidans `<head>` refererade den aldrig explicit. Chrome kunde alltså
aldrig upptäcka att sidan går att installera, oavsett vad service
workern gjorde. Fixat med en rad i metadata-objektet.

## Bakåtknappen kändes som utloggning — nu smart

"← Tillbaka" på `/priser` och `/butik-info` gick alltid till den
publika startsidan, som inte visar något om att man redan är inloggad
- kändes som en utloggning även om sessionen var helt intakt. Nu:
inloggad tar den dig till dashboard, utloggad till startsidan. Samma
fix på knapparna längst ner ("Bli medlem"/"Logga in för att köpa") -
visar rätt handling beroende på om du redan är inloggad.

## Rättat: bakåtknappen "loggade ut" beroende på statisk sidcachning

Bekräftat att fixet från förra omgången var rätt LOGIK, men Next.js
kunde ha byggt `/priser` och `/butik-info` som **statiska** sidor -
byggda en gång, samma resultat för alla besökare - eftersom sidorna
inte tidigare hade något som tvingade dem att räknas ut per besök.
Om sidan byggdes utan en inloggad session skulle ALLA se den
"utloggade" varianten, oavsett vem som faktiskt besökte den efteråt.
Nu tvingade till att alltid räknas ut på riktigt, för varje besök.

## Om något strular

- **"Cannot find module '@prisma/client'"** → du missade steg 4, kör
  `npx prisma generate` igen.
- **Databasfel vid registrering** → dubbelkolla att `DATABASE_URL` i `.env`
  är korrekt ikopierad från Supabase, inklusive lösenordet.
- **"JWT_SECRET is not set"** → steg 3 är inte klart, `.env`-filen saknar
  eller har en tom `JWT_SECRET`.
- **Om `npx prisma generate` frågar om att installera `prisma@8.0.0-rc...`**
  → svara **nej** (`n`). Kör istället `npm install --legacy-peer-deps` för
  att se till att version 7.10.0 (den vi byggt mot) faktiskt är installerad,
  och testa igen.

## Tekniska anteckningar (inget du behöver göra något åt)

Databasadressen (`DATABASE_URL`) läses numera från `prisma.config.ts` i
projektets rot, inte från `prisma/schema.prisma` — det är hur Prisma
version 7 fungerar. Filen är redan korrekt ifylld, den läser bara från din
`.env`. Om du någon gång ser en Prisma-kodexempel på nätet som skriver
`url = env("DATABASE_URL")` direkt i schema-filen — det är den gamla
metoden (Prisma 6 och tidigare) och stämmer inte längre.
