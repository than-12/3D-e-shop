import { useLanguage } from '@/hooks/use-language';
import { Button } from './button';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentLanguage === 'el' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('el')}
        className="min-w-[40px] px-2"
      >
        EL
      </Button>
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
        className="min-w-[40px] px-2"
      >
        EN
      </Button>
    </div>
  );
} 