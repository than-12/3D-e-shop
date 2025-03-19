import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import el from './locales/el.json';

// Έλεγχος αν υπάρχει αποθηκευμένη προτίμηση γλώσσας αν είμαστε στο browser
const getInitialLanguage = () => {
  try {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) return savedLanguage;
    }
    return 'el'; // Προεπιλογή στα ελληνικά
  } catch (e) {
    return 'el';
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      el: {
        translation: el
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'el',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n; 