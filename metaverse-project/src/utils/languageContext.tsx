import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the available languages
export type Language = 'pt' | 'en';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  setLanguage: () => {},
  t: () => '',
});

// Define translation keys type
type TranslationKey = 
  | 'plot.search.placeholder'
  | 'plot.search.button'
  | 'plot.current'
  | 'plot.loading'
  | 'controls.title'
  | 'controls.forward'
  | 'controls.backward'
  | 'controls.left'
  | 'controls.right'
  | 'controls.up'
  | 'controls.down'
  | 'controls.speed'
  | 'controls.look'
  | 'controls.search'
  | 'language.toggle';

// Define translations with proper typing
const translations: Record<Language, Record<TranslationKey, string>> = {
  pt: {
    // Plot search
    'plot.search.placeholder': 'Nº do terreno',
    'plot.search.button': 'Ir para terreno',
    'plot.current': 'Terreno #',
    'plot.loading': 'Carregando visualização 3D...',
    
    // Movement controls
    'controls.title': 'Controles de Movimento:',
    'controls.forward': '• W ou ↑: Mover para frente',
    'controls.backward': '• S ou ↓: Mover para trás',
    'controls.left': '• A ou ←: Mover para esquerda',
    'controls.right': '• D ou →: Mover para direita',
    'controls.up': '• E ou Espaço: Subir',
    'controls.down': '• Control: Descer',
    'controls.speed': '• Shift: Aumentar velocidade',
    'controls.look': '• Mouse: Olhar ao redor e mudar direção',
    'controls.search': '• Busca: Digite o número do terreno',
    
    // Language toggle
    'language.toggle': 'EN',
  },
  en: {
    // Plot search
    'plot.search.placeholder': 'Parcel number',
    'plot.search.button': 'Go to parcel',
    'plot.current': 'Parcel #',
    'plot.loading': 'Loading 3D view...',
    
    // Movement controls
    'controls.title': 'Movement Controls:',
    'controls.forward': '• W or ↑: Move forward',
    'controls.backward': '• S or ↓: Move backward',
    'controls.left': '• A or ←: Move left',
    'controls.right': '• D or →: Move right',
    'controls.up': '• E or Space: Move up',
    'controls.down': '• Control: Move down',
    'controls.speed': '• Shift: Increase speed',
    'controls.look': '• Mouse: Look around and change direction',
    'controls.search': '• Search: Enter the parcel number',
    
    // Language toggle
    'language.toggle': 'PT',
  }
};

// Create the provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as TranslationKey] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext); 