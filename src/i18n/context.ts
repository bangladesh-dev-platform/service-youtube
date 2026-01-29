import { createContext } from 'react';
import { Language, Vars } from './translations';

export interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Vars) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
