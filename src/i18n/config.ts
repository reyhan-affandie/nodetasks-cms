export type Locale = (typeof locales)[number];

export const locales = ["en", "de", "nl", "id", "ph"] as const;
export const defaultLocale: Locale = "en";
