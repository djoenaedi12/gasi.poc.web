import { en } from "./locales/en";
import { id } from "./locales/id";

export const translations = {
    id,
    en,
};

export type SupportedLocale = keyof typeof translations;

export type TranslationParams = Record<string, string | number | boolean | null | undefined>;

export const fallbackLocale: SupportedLocale = "id";

export const supportedLocales = Object.keys(translations) as SupportedLocale[];
