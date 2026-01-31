import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type UITheme = 'cinema' | 'blueprint' | 'lofi' | 'sticker';

interface ThemeInfo {
  id: UITheme;
  name: string;
  description: string;
  icon: string;
}

export const UI_THEMES: ThemeInfo[] = [
  { id: 'cinema', name: 'Neon Dreams', description: 'Cinematic vaporwave aesthetic with smooth transitions', icon: '🎬' },
  { id: 'blueprint', name: 'Tech Grid', description: 'Advanced engineering visualization with pulsing effects', icon: '📐' },
  { id: 'lofi', name: 'Twilight Zone', description: 'Serene animated night sky with living elements', icon: '🌸' },
  { id: 'sticker', name: 'Chaos Garage', description: 'Dynamic layered JDM culture with parallax depth', icon: '🏎️' },
];

const THEME_STORAGE_KEY = 'fh5-ui-theme';
const DARK_MODE_STORAGE_KEY = 'fh5-dark-mode';

interface ThemeContextType {
  currentTheme: UITheme;
  setTheme: (theme: UITheme) => void;
  themes: ThemeInfo[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<UITheme>(() => {
    if (typeof window === 'undefined') return 'cinema';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as UITheme;
      return saved && UI_THEMES.some(t => t.id === saved) ? saved : 'cinema';
    } catch {
      return 'cinema';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch {
      // Ignore storage errors
    }
  }, [currentTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode.toString());
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setTheme = useCallback((theme: UITheme) => {
    setCurrentTheme(theme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: UI_THEMES, isDarkMode, toggleDarkMode }}>
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
