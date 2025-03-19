import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  
  const changeLanguage = (language: 'el' | 'en') => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };
  
  return {
    t,
    currentLanguage,
    changeLanguage,
    isGreek: currentLanguage === 'el',
    isEnglish: currentLanguage === 'en',
  };
} 