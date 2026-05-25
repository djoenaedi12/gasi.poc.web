import { useMemo, useSyncExternalStore } from "react";

import {
    fallbackLocale,
    supportedLocales,
    translations,
    type SupportedLocale,
    type TranslationParams,
} from "./translations";

export type Translate = (key: string, params?: TranslationParams) => string;
export type { SupportedLocale, TranslationParams };
export { supportedLocales };

const storageKey = "gasi.locale";
const listeners = new Set<() => void>();
let activeLocale = readInitialLocale();

function readInitialLocale(): SupportedLocale {
    if (typeof window === "undefined") {
        return fallbackLocale;
    }

    const storedLocale = window.localStorage.getItem(storageKey);
    return isSupportedLocale(storedLocale) ? storedLocale : fallbackLocale;
}

function isSupportedLocale(locale: string | null): locale is SupportedLocale {
    return supportedLocales.includes(locale as SupportedLocale);
}

function interpolate(template: string, params: TranslationParams = {}) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, paramName: string) => {
        const value = params[paramName];
        return value === null || value === undefined ? "" : String(value);
    });
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return activeLocale;
}

export function getLocale() {
    return activeLocale;
}

export function setLocale(locale: SupportedLocale) {
    activeLocale = locale;

    if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, locale);
    }

    listeners.forEach((listener) => listener());
}

export function changeLanguage(locale: SupportedLocale) {
    setLocale(locale);
}

export function registerTranslations(locale: SupportedLocale, messages: Record<string, string>) {
    translations[locale] = {
        ...translations[locale],
        ...messages,
    };

    listeners.forEach((listener) => listener());
}

export function translate(key: string, params?: TranslationParams) {
    const template = translations[activeLocale][key] ?? translations[fallbackLocale][key] ?? key;
    return interpolate(template, params);
}

export function useI18n() {
    const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return useMemo(() => ({
        locale,
        changeLanguage,
        setLocale,
        supportedLocales,
        t: (key: string, params?: TranslationParams) => {
            const template = translations[locale][key] ?? translations[fallbackLocale][key] ?? key;
            return interpolate(template, params);
        },
    }), [locale]);
}
