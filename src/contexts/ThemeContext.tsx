import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type UITheme = 'cinema' | 'blueprint' | 'lofi' | 'sticker';

interface ThemeInfo {
  id: UITheme;
  name: string;
  description: string;
  icon: string;
}

export const UI_THEMES: ThemeInfo[] = [
  { id: 'cinema', name: 'JDM Cinema', description: 'Cinematic slideshow with Ken Burns', icon: '🎬' },
  { id: 'blueprint', name: 'Blueprint', description: 'Technical engineering paper', icon: '📐' },
  { id: 'lofi', name: 'Japanese Lofi', description: 'Chill night vibes with pagoda', icon: '🌸' },
  { id: 'sticker', name: 'Sticker Bomb', description: 'JDM sticker explosion', icon: '🏎️' },
];

const STORAGE_KEY = 'fh5-ui-theme';

interface ThemeContextType {
  currentTheme: UITheme;
  setTheme: (theme: UITheme) => void;
  themes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<UITheme>(() => {
    if (typeof window === 'undefined') return 'cinema';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as UITheme;
      return saved && UI_THEMES.some(t => t.id === saved) ? saved : 'cinema';
    } catch {
      return 'cinema';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme);
    } catch {
      // Ignore storage errors
    }
  }, [currentTheme]);

  const setTheme = useCallback((theme: UITheme) => {
    setCurrentTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: UI_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
