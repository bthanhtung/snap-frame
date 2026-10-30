'use client';
import { create } from 'zustand';

export interface Prefs { theme: 'dark' | 'light'; lang: 'en' | 'vi' }
const KEY = 'sf_prefs';
const initial = (): Prefs => {
  if (typeof window === 'undefined') return { theme: 'dark', lang: 'en' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { theme: saved.theme ?? 'dark', lang: saved.lang ?? (navigator.language?.startsWith('vi') ? 'vi' : 'en') };
  } catch { return { theme: 'dark', lang: 'en' }; }
};

export const usePrefs = create<Prefs & { set(p: Partial<Prefs>): void }>((set, get) => ({
  ...initial(),
  set(p) {
    set(p);
    const { set: _s, ...rest } = { ...get(), ...p };
    try { localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* private mode */ }
    if (p.theme) document.documentElement.classList.toggle('light', p.theme === 'light');
  },
}));
