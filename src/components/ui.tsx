'use client';
import { Check, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

export function Slider({ label, value, min, max, step, onChange, reset = 0, format }: {
  label: string; value: number; min: number; max: number; step: number; onChange(v: number): void; reset?: number; format?(v: number): string;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const origin = min < 0 ? pct(0) : 0, cur = pct(value);
  const [a, b] = [Math.min(origin, cur), Math.max(origin, cur)];
  const shown = format ? format(value) : (Math.abs(max - min) <= 2.5 ? Math.round(value * 100) : value.toFixed(2)).toString();
  return (
    <label className="block group" onDoubleClick={() => onChange(reset)}>
      <div className="flex items-center justify-between text-[13px] mb-0.5">
        <span className={value !== reset ? 'text-fg' : 'text-muted'}>{label}</span>
        <span className="tabular-nums text-xs text-faint group-hover:text-muted">{value > 0 && min < 0 ? '+' : ''}{shown}</span>
      </div>
      <input type="range" className="slider" min={min} max={max} step={step} value={value} aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, transparent ${a}%, var(--accent) ${a}%, var(--accent) ${b}%, transparent ${b}%) center / 100% 4px no-repeat, linear-gradient(var(--line), var(--line)) center / 100% 4px no-repeat` }} />
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, size = 'md' }: {
  value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange(v: T): void; size?: 'sm' | 'md';
}) {
  return (
    <div className="flex p-1 gap-1 rounded-xl bg-raised" role="radiogroup">
      {options.map(o => (
        <button key={o.value} role="radio" aria-checked={value === o.value} title={o.title} onClick={() => onChange(o.value)}
          className={`flex-1 ${size === 'sm' ? 'h-7 text-xs' : 'h-8 text-[13px]'} px-2 rounded-lg font-medium transition inline-flex items-center justify-center gap-1.5
            ${value === o.value ? 'bg-panel text-fg shadow-sm' : 'text-muted hover:text-fg'}`}>{o.label}</button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange(v: boolean): void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 text-[13px] py-1.5">
      <span className={checked ? 'text-fg' : 'text-muted'}>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-accent' : 'bg-raised border border-line'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="py-4 border-b border-line last:border-0">
      <div className="flex items-center justify-between mb-3"><h3 className="label">{title}</h3>{action}</div>
      {children}
    </section>
  );
}

/** Fire-and-forget toasts via a window event, so any module can raise one. */
export const toast = (text: string, kind: 'ok' | 'error' = 'ok') => window.dispatchEvent(new CustomEvent('sf:toast', { detail: { text, kind } }));
export function Toasts() {
  const [list, setList] = useState<{ id: number; text: string; kind: string }[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail, id = Date.now() + Math.random();
      setList(l => [...l, { id, ...d }]);
      setTimeout(() => setList(l => l.filter(x => x.id !== id)), 3000);
    };
    addEventListener('sf:toast', on);
    return () => removeEventListener('sf:toast', on);
  }, []);
  return (
    <div className="fixed z-[100] top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" aria-live="polite">
      {list.map(t => (
        <div key={t.id} className="animate-up flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fg text-bg text-sm font-medium shadow-2xl">
          {t.kind === 'error' ? <X className="size-4 text-red-500" /> : <Check className="size-4 text-emerald-500" />}{t.text}
        </div>
      ))}
    </div>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <defs><linearGradient id="sfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb547" /><stop offset="1" stopColor="#ff6a2b" /></linearGradient></defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#sfg)" />
        <rect x="7.5" y="7.5" width="17" height="13" rx="2" fill="#0c0c0d" />
        <circle cx="16" cy="14" r="3.6" fill="none" stroke="#ffb547" strokeWidth="1.8" />
        <rect x="9" y="22.5" width="9" height="1.8" rx=".9" fill="#0c0c0d" opacity=".7" />
      </svg>
      <span style={{ fontSize: size * 0.6 }}>SnapFrame</span>
    </span>
  );
}
