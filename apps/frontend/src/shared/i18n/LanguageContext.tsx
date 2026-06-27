import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '@RealEstate/types';
import { Language as LanguageEnum } from '@RealEstate/types';
import { userApi } from '../api/services';
import { getAccessToken } from '../auth/tokens';

const LANGUAGE_KEY = 'preferred-language';

type Ctx = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageCtx = createContext<Ctx>({
  language: LanguageEnum.EN,
  setLanguage: () => {},
});

function readStoredLanguage(): Language {
  if (typeof localStorage === 'undefined') return LanguageEnum.EN;
  const v = localStorage.getItem(LANGUAGE_KEY);
  if (v === LanguageEnum.EN || v === LanguageEnum.ES) return v as Language;
  return LanguageEnum.EN;
}

export function LanguageProvider({ children, preferredLanguage }: { children: React.ReactNode; preferredLanguage?: Language | null }) {
  const { i18n } = useTranslation();
  const changeLangRef = useRef(i18n.changeLanguage);
  changeLangRef.current = i18n.changeLanguage;

  const [language, setLanguageState] = useState<Language>(
    () => preferredLanguage ?? readStoredLanguage(),
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_KEY, next);
    changeLangRef.current(next.toLowerCase());
    if (getAccessToken()) {
      userApi.updateLanguage(next).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const lang = preferredLanguage ?? readStoredLanguage();
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    changeLangRef.current(lang.toLowerCase());
  }, [preferredLanguage]);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export function useLanguage(): Ctx {
  return useContext(LanguageCtx);
}
