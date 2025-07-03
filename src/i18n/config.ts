export type Locale = (typeof locales)[number];

export const locales = ["en", "id", "ph"] as const;
export const defaultLocale: Locale = "en";
