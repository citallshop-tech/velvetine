"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { COUNTRIES, REGION_ORDER, countriesInRegion, regionLabel, nameFor, type Region } from "@/lib/countries";

// TILLAGD 2026-09-21 - sök på land/område i Bläddra-flödet, på Christoffers
// uttryckliga önskemål. Ren GET-navigering (byter bara query-parametrar på
// samma sida) i stället för egen fetch-logik - sidan (discover/page.tsx) är
// redan en server-komponent som läser searchParams och skickar med rätt
// filter till getDiscoveryCandidates, så en vanlig navigering räcker och
// resultatet blir alltid konsekvent med det som faktiskt visas.
//
// UTÖKAD SAMMA DAG med ett fritextfält för stad/kommun, efter Christoffers
// följdfråga om att kunna söka ännu närmare (region eller till och med
// kommunnivå). En global, komplett lista över kommuner/städer per land
// finns inte och skulle vara ett enormt eget projekt - istället används
// User.locationCity (redan ett fritt textfält, se ProfileEditForm.tsx) med
// en vanlig delsträngssökning ("innehåller", skiftlägesokänslig, se
// src/lib/discovery.ts). Det ger samma praktiska resultat (sök på "Nacka"
// eller "Malmö" och bara de visas) utan att behöva bygga och underhålla en
// världsomspännande kommun-databas. Stad/kommun kan kombineras med
// land/område ovan (båda gäller samtidigt) eller användas helt fristående.
export function DiscoverFilters({
  activeCountry,
  activeRegion,
  activeCity,
}: {
  activeCountry: string | null;
  activeRegion: Region | null;
  activeCity: string | null;
}) {
  const t = useTranslations("Discover");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [cityInput, setCityInput] = useState(activeCity ?? "");

  const countriesForRegion = activeRegion ? countriesInRegion(activeRegion) : COUNTRIES;
  const sortedCountries = [...countriesForRegion].sort((a, b) =>
    nameFor(a, locale).localeCompare(nameFor(b, locale), locale)
  );

  function goTo(next: { region?: Region | null; country?: string | null; city?: string | null }) {
    const params = new URLSearchParams();
    const region = next.region !== undefined ? next.region : activeRegion;
    const country = next.country !== undefined ? next.country : activeCountry;
    const city = next.city !== undefined ? next.city : activeCity;
    // Ett val av land tar alltid bort ett tidigare regionval om landet inte
    // längre ligger i den regionen (t.ex. byter man region efter att redan
    // ha valt land) - annars kan man hamna i ett omöjligt filter (land X +
    // region Y där X inte finns i Y) som tyst ger noll resultat.
    if (country) {
      params.set("country", country);
    } else if (region) {
      params.set("region", region);
    }
    if (city) {
      params.set("city", city);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleRegionChange(value: string) {
    const region = (value || null) as Region | null;
    // Byter man region och det tidigare valda landet inte finns i den nya
    // regionen, nollställs landet - annars kan filtret bli motsägelsefullt.
    const countryStillValid = activeCountry && region
      ? countriesInRegion(region).some((c) => c.code === activeCountry)
      : Boolean(activeCountry) && !region;
    goTo({ region, country: countryStillValid ? undefined : null });
  }

  function handleCountryChange(value: string) {
    goTo({ country: value || null });
  }

  function submitCity() {
    goTo({ city: cityInput.trim() || null });
  }

  const hasActiveFilter = Boolean(activeCountry || activeRegion || activeCity);

  return (
    <div className="mb-4 rounded-sm border border-border bg-surface p-3">
      <p className="text-xs text-ivory-muted mb-2">{t("filterLabel")}</p>
      <div className="flex flex-wrap gap-2">
        <select
          value={activeRegion ?? ""}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="flex-1 min-w-[9rem] bg-surface-raised border border-border rounded-sm px-2 py-1.5 text-sm text-ivory focus:outline-none focus:border-gold"
        >
          <option value="">{t("filterAnyRegion")}</option>
          {REGION_ORDER.map((region) => (
            <option key={region} value={region}>
              {regionLabel(region, locale)}
            </option>
          ))}
        </select>
        <select
          value={activeCountry ?? ""}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="flex-1 min-w-[9rem] bg-surface-raised border border-border rounded-sm px-2 py-1.5 text-sm text-ivory focus:outline-none focus:border-gold"
        >
          <option value="">{t("filterAnyCountry")}</option>
          {sortedCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {nameFor(c, locale)}
            </option>
          ))}
        </select>
        <div className="flex flex-1 min-w-[9rem] gap-1">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCity();
            }}
            onBlur={submitCity}
            placeholder={t("filterCityPlaceholder")}
            maxLength={100}
            className="flex-1 min-w-0 bg-surface-raised border border-border rounded-sm px-2 py-1.5 text-sm text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={submitCity}
            aria-label={t("filterCitySearch")}
            className="shrink-0 rounded-sm border border-border px-2 text-sm text-ivory-muted hover:border-gold hover:text-gold"
          >
            {t("filterCitySearch")}
          </button>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setCityInput("");
              goTo({ region: null, country: null, city: null });
            }}
            className="text-sm text-ivory-muted hover:text-gold px-2"
          >
            {t("filterReset")}
          </button>
        )}
      </div>
    </div>
  );
}
