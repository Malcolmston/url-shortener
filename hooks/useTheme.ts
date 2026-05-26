'use client';
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'snip-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(stored ?? preferred);
    setThemeState(stored ?? preferred);
  }, []);

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem(STORAGE_KEY, t);
  };

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
