import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import elTranslation from './locales/el.json';

i18n
  // Ανιχνεύει αυτόματα τη γλώσσα του browser
  .use(LanguageDetector)
  // Περνάμε το i18n instance στο react-i18next
  .use(initReactI18next)
  // Αρχικοποίηση i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      el: {
        translation: elTranslation
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // δεν χρειάζεται για React καθώς φροντίζει το XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    saveMissing: false,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      // Καταγραφή μόνο στο development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[i18n] Λείπει μετάφραση: ${lng}:${ns}:${key}`);
      }
    }
  });

export default i18n; 