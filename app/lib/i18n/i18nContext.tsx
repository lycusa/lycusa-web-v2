'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import en from '@/app/locales/en.json';
import de from '@/app/locales/de.json';

export type Locale = 'en' | 'de';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<Locale, Translations> = { en, de };

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'lycusa-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [isHydrated, setIsHydrated] = useState(false);

    // Load saved locale on mount (client-side only)
    useEffect(() => {
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'de')) {
            setLocaleState(savedLocale);
        }
        setIsHydrated(true);
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }, []);

    // Translation function - supports nested keys like 'hero.title'
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let value: TranslationValue = translations[locale];

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = value[k];
            } else {
                // Key not found, return the key itself as fallback
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value === 'string') {
            return value;
        }

        console.warn(`Translation value is not a string for key: ${key}`);
        return key;
    }, [locale]);

    // Prevent hydration mismatch by showing nothing until hydrated
    // This ensures SSR content matches client content
    const contextValue = {
        locale: isHydrated ? locale : 'en',
        setLocale,
        t: isHydrated ? t : (key: string) => {
            // During SSR/initial render, use English translations
            const keys = key.split('.');
            let value: TranslationValue = translations['en'];

            for (const k of keys) {
                if (typeof value === 'object' && value !== null && k in value) {
                    value = value[k];
                } else {
                    return key;
                }
            }

            return typeof value === 'string' ? value : key;
        },
    };

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
