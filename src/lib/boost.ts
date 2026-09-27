// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - delad konstant
// mellan den gratis nivå-boosten (src/app/api/profile/boost/route.ts) och
// den poäng-köpta boosten (src/app/api/profile/boost/credits/route.ts), så
// båda ger EXAKT samma längd på boosten oavsett hur den betalades.
//
// Ligger i src/lib istället för att exporteras direkt från route.ts, för
// att Next.js App Router INTE tillåter några andra exports än de
// reserverade HTTP-metoderna (GET/POST/osv.) och ett fåtal specialfält i
// en route.ts-fil - ett extra namngivet export som BOOST_DURATION_MS
// bryter bygget ("... is not a valid Route export field").
export const BOOST_DURATION_MS = 30 * 60 * 1000; // 30 minutes
