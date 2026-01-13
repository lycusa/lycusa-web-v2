'use client';

import { useI18n, Locale } from '@/app/lib/i18n/i18nContext';

export default function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n();

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale !== locale) {
            setLocale(newLocale);
        }
    };

    return (
        <div
            className="relative flex items-center h-9 p-0.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]"
            role="radiogroup"
            aria-label="Language selection"
        >
            {/* Sliding indicator with gradient */}
            <div
                className={`absolute h-8 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${locale === 'de' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
                    }`}
                style={{
                    left: '2px',
                    background: 'linear-gradient(135deg, #63002B 0%, #8a1048 100%)',
                    boxShadow: '0 2px 8px rgba(99, 0, 43, 0.35), 0 1px 2px rgba(99, 0, 43, 0.2)',
                }}
            />

            <button
                onClick={() => handleLocaleChange('en')}
                className={`relative z-10 flex items-center justify-center w-10 h-8 rounded-full text-[11px] font-medium tracking-widest uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-tyrian-500 focus-visible:ring-offset-1 ${locale === 'en'
                        ? 'text-white'
                        : 'text-tyrian-800/70 hover:text-tyrian-800'
                    }`}
                aria-label={t('languageSwitcher.english')}
                aria-checked={locale === 'en'}
                role="radio"
            >
                EN
            </button>

            <button
                onClick={() => handleLocaleChange('de')}
                className={`relative z-10 flex items-center justify-center w-10 h-8 rounded-full text-[11px] font-medium tracking-widest uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-tyrian-500 focus-visible:ring-offset-1 ${locale === 'de'
                        ? 'text-white'
                        : 'text-tyrian-800/70 hover:text-tyrian-800'
                    }`}
                aria-label={t('languageSwitcher.german')}
                aria-checked={locale === 'de'}
                role="radio"
            >
                DE
            </button>
        </div>
    );
}
