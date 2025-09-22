import { useState, useEffect, ReactNode } from 'react';
import { LanguageContext } from '../hooks/useLanguage';
import { getTranslation } from '../lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    // Update document attributes for RTL support
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    
    // Update font family for Arabic
    if (language === 'ar') {
      document.body.style.fontFamily = "'Noto Sans Arabic', Arial, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
    }
  }, [language]);

  const t = (key: string) => getTranslation(language, key);
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
