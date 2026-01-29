import React, { useMemo, useState } from 'react';
import { I18nContext } from './context';
import { FALLBACK_LANG, Language, translations, Vars } from './translations';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return FALLBACK_LANG;
    const stored = localStorage.getItem('app_lang') as Language | null;
    if (stored && ['en', 'bn'].includes(stored)) return stored;
    return FALLBACK_LANG;
  });

  const value = useMemo(() => {
    const dictionary = translations[lang] || translations[FALLBACK_LANG] || translations.en;
    const translate = (key: string, vars?: Vars) => {
      const template = dictionary[key] ?? translations.en[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, 'g'), String(v)), template);
    };

    return {
      lang,
      setLang: (next: Language) => {
        localStorage.setItem('app_lang', next);
        setLang(next);
      },
      t: translate,
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
