import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  // next-intl sets this automatically whenever someone switches language
  // via the site's language switcher, so a returning visitor lands back
  // on their chosen language. Configured explicitly (rather than left on
  // defaults) so it's documented and has the right security attributes.
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});
