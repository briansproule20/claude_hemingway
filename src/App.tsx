import React, { createContext, useContext, useState, useEffect } from 'react';
import EchoControlHeader from './components/EchoControlHeader';
import ELATutorChatbot from './components/ELATutorChatbot';
import ErrorBoundary from './components/ErrorBoundary';

// Language Context
interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  languageOptions: Array<{ code: string; name: string; flag: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹' }
];

const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ela-tutor-language');
    if (savedLanguage && languageOptions.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('ela-tutor-language', currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, languageOptions }}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <EchoControlHeader />
          <main className="container mx-auto px-4 py-8">
            <ELATutorChatbot />
          </main>
        </div>
      </ErrorBoundary>
    </LanguageContext.Provider>
  );
};

export default App; 