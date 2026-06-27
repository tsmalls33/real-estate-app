import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import ca from './locales/ca/common.json';

i18n.use(initReactI18next).init({
  resources: { en: { common: en }, es: { common: es }, ca: { common: ca } },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnObjects: true,
  debug: process.env.NODE_ENV === 'development',
});

export default i18n;
