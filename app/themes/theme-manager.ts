'use client';

import { UserData } from '@/types/user-type';

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function initializeTheme(userData: UserData): void {
  applyTheme(userData.preferences.theme);
}

export function updateUserTheme(theme: 'light' | 'dark' | 'system'): void {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  userData.preferences.theme = theme;
  localStorage.setItem('userData', JSON.stringify(userData));
  applyTheme(theme);
}