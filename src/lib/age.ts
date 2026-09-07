const MINIMUM_AGE = 18;

/**
 * Returns the age in whole years for a given birth date, as of today.
 */
export function calculateAge(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

/**
 * Every signup path (register form, future OAuth signup, admin-created
 * accounts) must call this - never assume a birth date is valid just
 * because it parsed. Dating apps carry a specific, non-negotiable legal
 * obligation to keep minors out (see DSA Art. 28 and app-store policies).
 */
export function isOldEnough(birthDate: Date, today: Date = new Date()): boolean {
  return calculateAge(birthDate, today) >= MINIMUM_AGE;
}

export { MINIMUM_AGE };
