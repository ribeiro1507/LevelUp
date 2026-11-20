import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'green' | 'pink';

interface ThemeContextValue {
  theme: AppTheme;
  isPink: boolean;
  accentHex: string;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const STORAGE_THEME_KEY = 'levelup_app_theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'green';
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'pink' || saved === 'green') {
      return saved;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'green';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage write errors
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'pink' ? '#0B090B' : '#0A0D0B');
    }
  }, [theme]);

  const setTheme = (next: AppTheme) => {
    setThemeState(next);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'green' ? 'pink' : 'green'));
  };

  const value: ThemeContextValue = {
    theme,
    isPink: theme === 'pink',
    accentHex: theme === 'pink' ? '#FF4DA6' : '#78FF00',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'green',
      isPink: false,
      accentHex: '#78FF00',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}
