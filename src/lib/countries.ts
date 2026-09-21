// Global lista över länder + världsdel/region, till Velvetines platsfält
// och sök-/filterläget i Bläddra (Discover). TILLAGD 2026-09-21 på
// Christoffers uttryckliga önskemål, UTÖKAD SAMMA DAG med tyska/spanska
// namn när fler språk lades till i appen (se messages/de.json, es.json).
//
// Ersätter den gamla, hårdkodade 21-lands-listan som bara täckte Norden +
// västeuropa + USA/Kanada/Australien. Databasen (User.locationCountry) är
// redan ett fritt textfält utan enum-koppling (se
// src/app/api/profile/route.ts), så den här utökningen är helt
// bakåtkompatibel: gamla värden är fortfarande giltiga koder här.
//
// Namn lagras direkt här per språk (samma mönster som Tier.name/nameEn och
// Prompt.question/questionEn i src/lib/localizedField.ts) istället för som
// nycklar i messages/*.json - annars hade varje nytt språk behövt ~190
// extra rader i sin egen språkfil bara för landsnamn.
//
// OBS: det här är EN startlista på ~190 länder/territorier, inte
// nödvändigtvis alla FN-erkända stater - utöka fritt, det här är en
// startlista, inte en spärr.

export type Region =
  | "norden"
  | "europa"
  | "nordamerika"
  | "sydamerika"
  | "afrika"
  | "mellanostern"
  | "asien"
  | "oceanien";

export const REGION_ORDER: Region[] = [
  "norden",
  "europa",
  "nordamerika",
  "sydamerika",
  "mellanostern",
  "asien",
  "afrika",
  "oceanien",
];

// Håll i synk med locales i src/i18n/routing.ts. Faller tillbaka till
// engelska (se countryLabel/regionLabel) om ett språk saknar en egen rad
// nedan - ska i praktiken aldrig hända eftersom alla språk som finns i
// routing.ts också fylls i här samtidigt.
export type SupportedLocale = "sv" | "en" | "de" | "es";

export const REGION_LABELS: Record<Region, Record<SupportedLocale, string>> = {
  norden: { sv: "Norden", en: "Nordic countries", de: "Nordische Länder", es: "Países nórdicos" },
  europa: { sv: "Europa (övriga)", en: "Europe (other)", de: "Europa (übrige)", es: "Europa (resto)" },
  nordamerika: {
    sv: "Nord- och Centralamerika",
    en: "North & Central America",
    de: "Nord- und Mittelamerika",
    es: "Norteamérica y Centroamérica",
  },
  sydamerika: { sv: "Sydamerika", en: "South America", de: "Südamerika", es: "Sudamérica" },
  mellanostern: { sv: "Mellanöstern", en: "Middle East", de: "Naher Osten", es: "Oriente Medio" },
  asien: { sv: "Asien", en: "Asia", de: "Asien", es: "Asia" },
  afrika: { sv: "Afrika", en: "Africa", de: "Afrika", es: "África" },
  oceanien: { sv: "Oceanien", en: "Oceania", de: "Ozeanien", es: "Oceanía" },
};

export interface CountryOption {
  code: string; // ISO 3166-1 alpha-2
  names: Record<SupportedLocale, string>;
  region: Region;
}

// Kortform-hjälpare för att hålla tabellen nedan läsbar - bygger bara ett
// { sv, en, de, es }-objekt utan att man behöver skriva nyckelnamnen 190 gånger.
function n(sv: string, en: string, de: string, es: string): Record<SupportedLocale, string> {
  return { sv, en, de, es };
}

export const COUNTRIES: CountryOption[] = [
  // ---- Norden ----
  { code: "SE", names: n("Sverige", "Sweden", "Schweden", "Suecia"), region: "norden" },
  { code: "NO", names: n("Norge", "Norway", "Norwegen", "Noruega"), region: "norden" },
  { code: "DK", names: n("Danmark", "Denmark", "Dänemark", "Dinamarca"), region: "norden" },
  { code: "FI", names: n("Finland", "Finland", "Finnland", "Finlandia"), region: "norden" },
  { code: "IS", names: n("Island", "Iceland", "Island", "Islandia"), region: "norden" },

  // ---- Europa (övriga) ----
  { code: "GB", names: n("Storbritannien", "United Kingdom", "Vereinigtes Königreich", "Reino Unido"), region: "europa" },
  { code: "IE", names: n("Irland", "Ireland", "Irland", "Irlanda"), region: "europa" },
  { code: "DE", names: n("Tyskland", "Germany", "Deutschland", "Alemania"), region: "europa" },
  { code: "FR", names: n("Frankrike", "France", "Frankreich", "Francia"), region: "europa" },
  { code: "ES", names: n("Spanien", "Spain", "Spanien", "España"), region: "europa" },
  { code: "PT", names: n("Portugal", "Portugal", "Portugal", "Portugal"), region: "europa" },
  { code: "IT", names: n("Italien", "Italy", "Italien", "Italia"), region: "europa" },
  { code: "NL", names: n("Nederländerna", "Netherlands", "Niederlande", "Países Bajos"), region: "europa" },
  { code: "BE", names: n("Belgien", "Belgium", "Belgien", "Bélgica"), region: "europa" },
  { code: "LU", names: n("Luxemburg", "Luxembourg", "Luxemburg", "Luxemburgo"), region: "europa" },
  { code: "CH", names: n("Schweiz", "Switzerland", "Schweiz", "Suiza"), region: "europa" },
  { code: "AT", names: n("Österrike", "Austria", "Österreich", "Austria"), region: "europa" },
  { code: "PL", names: n("Polen", "Poland", "Polen", "Polonia"), region: "europa" },
  { code: "CZ", names: n("Tjeckien", "Czechia", "Tschechien", "Chequia"), region: "europa" },
  { code: "SK", names: n("Slovakien", "Slovakia", "Slowakei", "Eslovaquia"), region: "europa" },
  { code: "HU", names: n("Ungern", "Hungary", "Ungarn", "Hungría"), region: "europa" },
  { code: "RO", names: n("Rumänien", "Romania", "Rumänien", "Rumanía"), region: "europa" },
  { code: "BG", names: n("Bulgarien", "Bulgaria", "Bulgarien", "Bulgaria"), region: "europa" },
  { code: "GR", names: n("Grekland", "Greece", "Griechenland", "Grecia"), region: "europa" },
  { code: "HR", names: n("Kroatien", "Croatia", "Kroatien", "Croacia"), region: "europa" },
  { code: "SI", names: n("Slovenien", "Slovenia", "Slowenien", "Eslovenia"), region: "europa" },
  { code: "RS", names: n("Serbien", "Serbia", "Serbien", "Serbia"), region: "europa" },
  { code: "BA", names: n("Bosnien och Hercegovina", "Bosnia and Herzegovina", "Bosnien und Herzegowina", "Bosnia y Herzegovina"), region: "europa" },
  { code: "ME", names: n("Montenegro", "Montenegro", "Montenegro", "Montenegro"), region: "europa" },
  { code: "MK", names: n("Nordmakedonien", "North Macedonia", "Nordmazedonien", "Macedonia del Norte"), region: "europa" },
  { code: "AL", names: n("Albanien", "Albania", "Albanien", "Albania"), region: "europa" },
  { code: "XK", names: n("Kosovo", "Kosovo", "Kosovo", "Kosovo"), region: "europa" },
  { code: "EE", names: n("Estland", "Estonia", "Estland", "Estonia"), region: "europa" },
  { code: "LV", names: n("Lettland", "Latvia", "Lettland", "Letonia"), region: "europa" },
  { code: "LT", names: n("Litauen", "Lithuania", "Litauen", "Lituania"), region: "europa" },
  { code: "UA", names: n("Ukraina", "Ukraine", "Ukraine", "Ucrania"), region: "europa" },
  { code: "BY", names: n("Belarus", "Belarus", "Belarus", "Bielorrusia"), region: "europa" },
  { code: "MD", names: n("Moldavien", "Moldova", "Moldau", "Moldavia"), region: "europa" },
  { code: "RU", names: n("Ryssland", "Russia", "Russland", "Rusia"), region: "europa" },
  { code: "MT", names: n("Malta", "Malta", "Malta", "Malta"), region: "europa" },
  { code: "CY", names: n("Cypern", "Cyprus", "Zypern", "Chipre"), region: "europa" },
  { code: "AD", names: n("Andorra", "Andorra", "Andorra", "Andorra"), region: "europa" },
  { code: "MC", names: n("Monaco", "Monaco", "Monaco", "Mónaco"), region: "europa" },
  { code: "LI", names: n("Liechtenstein", "Liechtenstein", "Liechtenstein", "Liechtenstein"), region: "europa" },
  { code: "SM", names: n("San Marino", "San Marino", "San Marino", "San Marino"), region: "europa" },
  { code: "VA", names: n("Vatikanstaten", "Vatican City", "Vatikanstadt", "Ciudad del Vaticano"), region: "europa" },

  // ---- Nord- och Centralamerika ----
  { code: "US", names: n("USA", "United States", "USA", "Estados Unidos"), region: "nordamerika" },
  { code: "CA", names: n("Kanada", "Canada", "Kanada", "Canadá"), region: "nordamerika" },
  { code: "MX", names: n("Mexiko", "Mexico", "Mexiko", "México"), region: "nordamerika" },
  { code: "GT", names: n("Guatemala", "Guatemala", "Guatemala", "Guatemala"), region: "nordamerika" },
  { code: "BZ", names: n("Belize", "Belize", "Belize", "Belice"), region: "nordamerika" },
  { code: "HN", names: n("Honduras", "Honduras", "Honduras", "Honduras"), region: "nordamerika" },
  { code: "SV", names: n("El Salvador", "El Salvador", "El Salvador", "El Salvador"), region: "nordamerika" },
  { code: "NI", names: n("Nicaragua", "Nicaragua", "Nicaragua", "Nicaragua"), region: "nordamerika" },
  { code: "CR", names: n("Costa Rica", "Costa Rica", "Costa Rica", "Costa Rica"), region: "nordamerika" },
  { code: "PA", names: n("Panama", "Panama", "Panama", "Panamá"), region: "nordamerika" },
  { code: "CU", names: n("Kuba", "Cuba", "Kuba", "Cuba"), region: "nordamerika" },
  { code: "DO", names: n("Dominikanska republiken", "Dominican Republic", "Dominikanische Republik", "República Dominicana"), region: "nordamerika" },
  { code: "HT", names: n("Haiti", "Haiti", "Haiti", "Haití"), region: "nordamerika" },
  { code: "JM", names: n("Jamaica", "Jamaica", "Jamaika", "Jamaica"), region: "nordamerika" },
  { code: "TT", names: n("Trinidad och Tobago", "Trinidad and Tobago", "Trinidad und Tobago", "Trinidad y Tobago"), region: "nordamerika" },
  { code: "BS", names: n("Bahamas", "Bahamas", "Bahamas", "Bahamas"), region: "nordamerika" },
  { code: "BB", names: n("Barbados", "Barbados", "Barbados", "Barbados"), region: "nordamerika" },

  // ---- Sydamerika ----
  { code: "BR", names: n("Brasilien", "Brazil", "Brasilien", "Brasil"), region: "sydamerika" },
  { code: "AR", names: n("Argentina", "Argentina", "Argentinien", "Argentina"), region: "sydamerika" },
  { code: "CL", names: n("Chile", "Chile", "Chile", "Chile"), region: "sydamerika" },
  { code: "CO", names: n("Colombia", "Colombia", "Kolumbien", "Colombia"), region: "sydamerika" },
  { code: "PE", names: n("Peru", "Peru", "Peru", "Perú"), region: "sydamerika" },
  { code: "VE", names: n("Venezuela", "Venezuela", "Venezuela", "Venezuela"), region: "sydamerika" },
  { code: "EC", names: n("Ecuador", "Ecuador", "Ecuador", "Ecuador"), region: "sydamerika" },
  { code: "BO", names: n("Bolivia", "Bolivia", "Bolivien", "Bolivia"), region: "sydamerika" },
  { code: "PY", names: n("Paraguay", "Paraguay", "Paraguay", "Paraguay"), region: "sydamerika" },
  { code: "UY", names: n("Uruguay", "Uruguay", "Uruguay", "Uruguay"), region: "sydamerika" },
  { code: "GY", names: n("Guyana", "Guyana", "Guyana", "Guyana"), region: "sydamerika" },
  { code: "SR", names: n("Surinam", "Suriname", "Suriname", "Surinam"), region: "sydamerika" },

  // ---- Mellanöstern ----
  { code: "SA", names: n("Saudiarabien", "Saudi Arabia", "Saudi-Arabien", "Arabia Saudita"), region: "mellanostern" },
  { code: "AE", names: n("Förenade Arabemiraten", "United Arab Emirates", "Vereinigte Arabische Emirate", "Emiratos Árabes Unidos"), region: "mellanostern" },
  { code: "IL", names: n("Israel", "Israel", "Israel", "Israel"), region: "mellanostern" },
  { code: "TR", names: n("Turkiet", "Turkey", "Türkei", "Turquía"), region: "mellanostern" },
  { code: "IR", names: n("Iran", "Iran", "Iran", "Irán"), region: "mellanostern" },
  { code: "IQ", names: n("Irak", "Iraq", "Irak", "Irak"), region: "mellanostern" },
  { code: "JO", names: n("Jordanien", "Jordan", "Jordanien", "Jordania"), region: "mellanostern" },
  { code: "LB", names: n("Libanon", "Lebanon", "Libanon", "Líbano"), region: "mellanostern" },
  { code: "KW", names: n("Kuwait", "Kuwait", "Kuwait", "Kuwait"), region: "mellanostern" },
  { code: "QA", names: n("Qatar", "Qatar", "Katar", "Catar"), region: "mellanostern" },
  { code: "BH", names: n("Bahrain", "Bahrain", "Bahrain", "Baréin"), region: "mellanostern" },
  { code: "OM", names: n("Oman", "Oman", "Oman", "Omán"), region: "mellanostern" },
  { code: "YE", names: n("Jemen", "Yemen", "Jemen", "Yemen"), region: "mellanostern" },
  { code: "SY", names: n("Syrien", "Syria", "Syrien", "Siria"), region: "mellanostern" },
  { code: "PS", names: n("Palestina", "Palestine", "Palästina", "Palestina"), region: "mellanostern" },

  // ---- Asien ----
  { code: "CN", names: n("Kina", "China", "China", "China"), region: "asien" },
  { code: "JP", names: n("Japan", "Japan", "Japan", "Japón"), region: "asien" },
  { code: "KR", names: n("Sydkorea", "South Korea", "Südkorea", "Corea del Sur"), region: "asien" },
  { code: "KP", names: n("Nordkorea", "North Korea", "Nordkorea", "Corea del Norte"), region: "asien" },
  { code: "IN", names: n("Indien", "India", "Indien", "India"), region: "asien" },
  { code: "PK", names: n("Pakistan", "Pakistan", "Pakistan", "Pakistán"), region: "asien" },
  { code: "BD", names: n("Bangladesh", "Bangladesh", "Bangladesch", "Bangladés"), region: "asien" },
  { code: "LK", names: n("Sri Lanka", "Sri Lanka", "Sri Lanka", "Sri Lanka"), region: "asien" },
  { code: "NP", names: n("Nepal", "Nepal", "Nepal", "Nepal"), region: "asien" },
  { code: "BT", names: n("Bhutan", "Bhutan", "Bhutan", "Bután"), region: "asien" },
  { code: "MV", names: n("Maldiverna", "Maldives", "Malediven", "Maldivas"), region: "asien" },
  { code: "TH", names: n("Thailand", "Thailand", "Thailand", "Tailandia"), region: "asien" },
  { code: "VN", names: n("Vietnam", "Vietnam", "Vietnam", "Vietnam"), region: "asien" },
  { code: "PH", names: n("Filippinerna", "Philippines", "Philippinen", "Filipinas"), region: "asien" },
  { code: "ID", names: n("Indonesien", "Indonesia", "Indonesien", "Indonesia"), region: "asien" },
  { code: "MY", names: n("Malaysia", "Malaysia", "Malaysia", "Malasia"), region: "asien" },
  { code: "SG", names: n("Singapore", "Singapore", "Singapur", "Singapur"), region: "asien" },
  { code: "MM", names: n("Myanmar", "Myanmar", "Myanmar", "Myanmar"), region: "asien" },
  { code: "KH", names: n("Kambodja", "Cambodia", "Kambodscha", "Camboya"), region: "asien" },
  { code: "LA", names: n("Laos", "Laos", "Laos", "Laos"), region: "asien" },
  { code: "BN", names: n("Brunei", "Brunei", "Brunei", "Brunéi"), region: "asien" },
  { code: "TL", names: n("Östtimor", "Timor-Leste", "Osttimor", "Timor Oriental"), region: "asien" },
  { code: "MN", names: n("Mongoliet", "Mongolia", "Mongolei", "Mongolia"), region: "asien" },
  { code: "KZ", names: n("Kazakstan", "Kazakhstan", "Kasachstan", "Kazajistán"), region: "asien" },
  { code: "UZ", names: n("Uzbekistan", "Uzbekistan", "Usbekistan", "Uzbekistán"), region: "asien" },
  { code: "TM", names: n("Turkmenistan", "Turkmenistan", "Turkmenistan", "Turkmenistán"), region: "asien" },
  { code: "TJ", names: n("Tadzjikistan", "Tajikistan", "Tadschikistan", "Tayikistán"), region: "asien" },
  { code: "KG", names: n("Kirgizistan", "Kyrgyzstan", "Kirgisistan", "Kirguistán"), region: "asien" },
  { code: "AF", names: n("Afghanistan", "Afghanistan", "Afghanistan", "Afganistán"), region: "asien" },
  { code: "HK", names: n("Hongkong", "Hong Kong", "Hongkong", "Hong Kong"), region: "asien" },
  { code: "MO", names: n("Macao", "Macao", "Macau", "Macao"), region: "asien" },
  { code: "TW", names: n("Taiwan", "Taiwan", "Taiwan", "Taiwán"), region: "asien" },

  // ---- Afrika ----
  { code: "ZA", names: n("Sydafrika", "South Africa", "Südafrika", "Sudáfrica"), region: "afrika" },
  { code: "EG", names: n("Egypten", "Egypt", "Ägypten", "Egipto"), region: "afrika" },
  { code: "NG", names: n("Nigeria", "Nigeria", "Nigeria", "Nigeria"), region: "afrika" },
  { code: "KE", names: n("Kenya", "Kenya", "Kenia", "Kenia"), region: "afrika" },
  { code: "GH", names: n("Ghana", "Ghana", "Ghana", "Ghana"), region: "afrika" },
  { code: "ET", names: n("Etiopien", "Ethiopia", "Äthiopien", "Etiopía"), region: "afrika" },
  { code: "TZ", names: n("Tanzania", "Tanzania", "Tansania", "Tanzania"), region: "afrika" },
  { code: "UG", names: n("Uganda", "Uganda", "Uganda", "Uganda"), region: "afrika" },
  { code: "MA", names: n("Marocko", "Morocco", "Marokko", "Marruecos"), region: "afrika" },
  { code: "DZ", names: n("Algeriet", "Algeria", "Algerien", "Argelia"), region: "afrika" },
  { code: "TN", names: n("Tunisien", "Tunisia", "Tunesien", "Túnez"), region: "afrika" },
  { code: "LY", names: n("Libyen", "Libya", "Libyen", "Libia"), region: "afrika" },
  { code: "SD", names: n("Sudan", "Sudan", "Sudan", "Sudán"), region: "afrika" },
  { code: "SN", names: n("Senegal", "Senegal", "Senegal", "Senegal"), region: "afrika" },
  { code: "CI", names: n("Elfenbenskusten", "Ivory Coast", "Elfenbeinküste", "Costa de Marfil"), region: "afrika" },
  { code: "CM", names: n("Kamerun", "Cameroon", "Kamerun", "Camerún"), region: "afrika" },
  { code: "ZM", names: n("Zambia", "Zambia", "Sambia", "Zambia"), region: "afrika" },
  { code: "ZW", names: n("Zimbabwe", "Zimbabwe", "Simbabwe", "Zimbabue"), region: "afrika" },
  { code: "MZ", names: n("Moçambique", "Mozambique", "Mosambik", "Mozambique"), region: "afrika" },
  { code: "AO", names: n("Angola", "Angola", "Angola", "Angola"), region: "afrika" },
  { code: "NA", names: n("Namibia", "Namibia", "Namibia", "Namibia"), region: "afrika" },
  { code: "BW", names: n("Botswana", "Botswana", "Botswana", "Botsuana"), region: "afrika" },
  { code: "RW", names: n("Rwanda", "Rwanda", "Ruanda", "Ruanda"), region: "afrika" },
  { code: "ML", names: n("Mali", "Mali", "Mali", "Malí"), region: "afrika" },
  { code: "BF", names: n("Burkina Faso", "Burkina Faso", "Burkina Faso", "Burkina Faso"), region: "afrika" },
  { code: "NE", names: n("Niger", "Niger", "Niger", "Níger"), region: "afrika" },
  { code: "TD", names: n("Tchad", "Chad", "Tschad", "Chad"), region: "afrika" },
  { code: "MG", names: n("Madagaskar", "Madagascar", "Madagaskar", "Madagascar"), region: "afrika" },
  { code: "MW", names: n("Malawi", "Malawi", "Malawi", "Malaui"), region: "afrika" },
  { code: "SO", names: n("Somalia", "Somalia", "Somalia", "Somalia"), region: "afrika" },
  { code: "CD", names: n("Kongo-Kinshasa (DR Kongo)", "DR Congo", "Demokratische Republik Kongo", "República Democrática del Congo"), region: "afrika" },
  { code: "CG", names: n("Kongo-Brazzaville", "Republic of the Congo", "Republik Kongo", "República del Congo"), region: "afrika" },
  { code: "GA", names: n("Gabon", "Gabon", "Gabun", "Gabón"), region: "afrika" },
  { code: "GM", names: n("Gambia", "Gambia", "Gambia", "Gambia"), region: "afrika" },
  { code: "GN", names: n("Guinea", "Guinea", "Guinea", "Guinea"), region: "afrika" },
  { code: "SL", names: n("Sierra Leone", "Sierra Leone", "Sierra Leone", "Sierra Leona"), region: "afrika" },
  { code: "LR", names: n("Liberia", "Liberia", "Liberia", "Liberia"), region: "afrika" },
  { code: "TG", names: n("Togo", "Togo", "Togo", "Togo"), region: "afrika" },
  { code: "BJ", names: n("Benin", "Benin", "Benin", "Benín"), region: "afrika" },
  { code: "MR", names: n("Mauretanien", "Mauritania", "Mauretanien", "Mauritania"), region: "afrika" },
  { code: "DJ", names: n("Djibouti", "Djibouti", "Dschibuti", "Yibuti"), region: "afrika" },
  { code: "ER", names: n("Eritrea", "Eritrea", "Eritrea", "Eritrea"), region: "afrika" },
  { code: "SS", names: n("Sydsudan", "South Sudan", "Südsudan", "Sudán del Sur"), region: "afrika" },
  { code: "LS", names: n("Lesotho", "Lesotho", "Lesotho", "Lesoto"), region: "afrika" },
  { code: "SZ", names: n("Eswatini", "Eswatini", "Eswatini", "Esuatini"), region: "afrika" },
  { code: "MU", names: n("Mauritius", "Mauritius", "Mauritius", "Mauricio"), region: "afrika" },
  { code: "SC", names: n("Seychellerna", "Seychelles", "Seychellen", "Seychelles"), region: "afrika" },
  { code: "CV", names: n("Kap Verde", "Cape Verde", "Kap Verde", "Cabo Verde"), region: "afrika" },
  { code: "KM", names: n("Komorerna", "Comoros", "Komoren", "Comoras"), region: "afrika" },
  { code: "ST", names: n("São Tomé och Príncipe", "São Tomé and Príncipe", "São Tomé und Príncipe", "Santo Tomé y Príncipe"), region: "afrika" },
  { code: "GW", names: n("Guinea-Bissau", "Guinea-Bissau", "Guinea-Bissau", "Guinea-Bisáu"), region: "afrika" },
  { code: "GQ", names: n("Ekvatorialguinea", "Equatorial Guinea", "Äquatorialguinea", "Guinea Ecuatorial"), region: "afrika" },
  { code: "EH", names: n("Västsahara", "Western Sahara", "Westsahara", "Sahara Occidental"), region: "afrika" },

  // ---- Oceanien ----
  { code: "AU", names: n("Australien", "Australia", "Australien", "Australia"), region: "oceanien" },
  { code: "NZ", names: n("Nya Zeeland", "New Zealand", "Neuseeland", "Nueva Zelanda"), region: "oceanien" },
  { code: "FJ", names: n("Fiji", "Fiji", "Fidschi", "Fiyi"), region: "oceanien" },
  { code: "PG", names: n("Papua Nya Guinea", "Papua New Guinea", "Papua-Neuguinea", "Papúa Nueva Guinea"), region: "oceanien" },
  { code: "SB", names: n("Salomonöarna", "Solomon Islands", "Salomonen", "Islas Salomón"), region: "oceanien" },
  { code: "VU", names: n("Vanuatu", "Vanuatu", "Vanuatu", "Vanuatu"), region: "oceanien" },
  { code: "WS", names: n("Samoa", "Samoa", "Samoa", "Samoa"), region: "oceanien" },
  { code: "TO", names: n("Tonga", "Tonga", "Tonga", "Tonga"), region: "oceanien" },
  { code: "KI", names: n("Kiribati", "Kiribati", "Kiribati", "Kiribati"), region: "oceanien" },
  { code: "FM", names: n("Mikronesien", "Micronesia", "Mikronesien", "Micronesia"), region: "oceanien" },
  { code: "MH", names: n("Marshallöarna", "Marshall Islands", "Marshallinseln", "Islas Marshall"), region: "oceanien" },
  { code: "PW", names: n("Palau", "Palau", "Palau", "Palaos"), region: "oceanien" },
  { code: "NR", names: n("Nauru", "Nauru", "Nauru", "Nauru"), region: "oceanien" },
  { code: "TV", names: n("Tuvalu", "Tuvalu", "Tuvalu", "Tuvalu"), region: "oceanien" },
];

const BY_CODE: Map<string, CountryOption> = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(code: string | null | undefined): CountryOption | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code);
}

function asLocale(locale: string): SupportedLocale {
  return locale === "en" || locale === "de" || locale === "es" ? locale : "sv";
}

/** Landsnamnet på rätt språk direkt från ett CountryOption-objekt (t.ex. när
 * man redan har hela objektet från countriesSorted/countriesInRegion och
 * bara vill skriva ut namnet, istället för att gå via koden och countryLabel). */
export function nameFor(country: CountryOption, locale: string): string {
  return country.names[asLocale(locale)];
}

/** Landets namn på rätt språk, med fallback till den lagrade koden själv om
 * den råkar vara ett äldre/okänt värde (t.ex. "OTHER" från den gamla listan,
 * eller fritext som fanns innan koden gjordes om) - visar aldrig "undefined". */
export function countryLabel(code: string | null | undefined, locale: string): string | null {
  if (!code) return null;
  const c = findCountry(code);
  if (!c) return code === "OTHER" ? null : code;
  return c.names[asLocale(locale)];
}

export function countriesInRegion(region: Region): CountryOption[] {
  return COUNTRIES.filter((c) => c.region === region);
}

export function countriesSorted(locale: string): CountryOption[] {
  const loc = asLocale(locale);
  return [...COUNTRIES].sort((a, b) => a.names[loc].localeCompare(b.names[loc], locale));
}

export function regionLabel(region: Region, locale: string): string {
  return REGION_LABELS[region][asLocale(locale)];
}
