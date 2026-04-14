'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  // Load preference from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('ingyemel-lang') as Language;
    if (saved && (saved === 'es' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ingyemel-lang', lang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = (translations as any)[language];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        console.warn(`Translation missing for: ${path} in ${language}`);
        return path;
      }
    }
    return current || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
