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
            className="relative flex items-center h-[44px] p-1 bg-gradient-to-br from-tyrian-800 to-tyrian-900 border border-tyrian-600/30 rounded-xl shadow-lg shadow-tyrian-900/20"
            role="radiogroup"
            aria-label="Language selection"
        >
            {/* Sliding indicator */}
            <div
                className={`absolute h-[36px] w-[calc(50%-2px)] bg-white rounded-lg shadow-md transition-all duration-300 ease-out ${locale === 'de' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
                    }`}
                style={{
                    left: '4px',
                }}
            />

            <button
                onClick={() => handleLocaleChange('en')}
                className={`relative z-10 flex items-center justify-center gap-1.5 w-[44px] h-[36px] rounded-lg text-xs font-bold tracking-wide transition-colors duration-300 ${locale === 'en'
                    ? 'text-tyrian-800'
                    : 'text-tyrian-200 hover:text-white'
                    }`}
                aria-label={t('languageSwitcher.english')}
                aria-checked={locale === 'en'}
                role="radio"
            >
                EN
            </button>

            <button
                onClick={() => handleLocaleChange('de')}
                className={`relative z-10 flex items-center justify-center gap-1.5 w-[44px] h-[36px] rounded-lg text-xs font-bold tracking-wide transition-colors duration-300 ${locale === 'de'
                    ? 'text-tyrian-800'
                    : 'text-tyrian-200 hover:text-white'
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
