'use client';
import { usePrefs } from '@/state/prefs';
import vi from './vi';

/** English lives inline at the call site; other languages are flat maps. */
export function useT() {
  const lang = usePrefs(s => s.lang);
  return Object.assign((key: string, en: string, vars?: Record<string, string | number>) => {
    const s = (lang === 'vi' ? vi[key] : undefined) ?? en;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
  }, { lang });
}
export type T = ReturnType<typeof useT>;
