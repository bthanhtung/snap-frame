'use client';
import { useEffect, useRef, useState } from 'react';
import type { Fonts } from '@/lib/frame';
import { useT } from '@/lib/i18n';
import { ADJUSTMENTS, BRANDS, LOOKS, type Brand } from '@/lib/looks';
import type { Edit, Photo } from '@/state/editor';
import { AspectPicker, FrameTile, STYLE_ORDER, useFrameThumbs, useLookThumbs } from './Panels';
import { Slider } from './ui';

type Up = (key: string, fn: (e: Edit) => Edit) => void;

/** Keeps the selected item of a horizontal strip in view. */
function useCentred(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector('[data-active="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [dep]);
  return ref;
}

function Chips<T extends string>({ value, items, onChange, label }: { value: T; items: readonly T[]; onChange(v: T): void; label(v: T): string }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4">
      {items.map(b => (
        <button key={b} onClick={() => onChange(b)}
          className={`shrink-0 h-7 px-3 rounded-full text-xs font-medium transition ${value === b ? 'bg-fg text-bg' : 'bg-raised text-muted'}`}>{label(b)}</button>
      ))}
    </div>
  );
}

export function CompactLooks({ photo, edit, update }: { photo: Photo; edit: Edit; update: Up }) {
  const t = useT();
  const thumb = useLookThumbs(photo);
  const [brand, setBrand] = useState<Brand | 'all'>(() => LOOKS.find(l => l.id === edit.look)?.brand ?? 'all');
  const strip = useCentred(`${brand}:${edit.look}`);
  const current = LOOKS.find(l => l.id === edit.look);
  const list: { id: string | null; name: string }[] = [
    ...(brand === 'all' ? [{ id: null, name: t('looks.none', 'Original') }] : []),
    ...LOOKS.filter(l => brand === 'all' || l.brand === brand),
  ];
  return (
    <div className="space-y-2.5">
      <div className="px-4 h-[54px]">
        {current ? <Slider label={current.name} value={edit.strength} min={0} max={1} step={0.01} reset={1}
          onChange={v => update('strength', e => ({ ...e, strength: v }))} format={v => `${Math.round(v * 100)}%`} />
          : <p className="text-xs text-muted pt-2">{t('m.pickLook', 'Pick a film look — swipe for more')}</p>}
      </div>
      <Chips<Brand | 'all'> value={brand} items={['all', ...BRANDS]} onChange={setBrand} label={b => (b === 'all' ? t('looks.all', 'All') : t(`brand.${b}`, b))} />
      <div ref={strip} className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1 snap-x">
        {list.map(l => (
          <button key={String(l.id)} data-active={edit.look === l.id} onClick={() => update('look', e => ({ ...e, look: l.id }))} className="shrink-0 w-[68px] snap-start">
            <div className={`size-[68px] rounded-xl overflow-hidden ring-2 transition ${edit.look === l.id ? 'ring-accent' : 'ring-transparent'}`}>
              {thumb(l.id) ? <img src={thumb(l.id)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-raised animate-pulse" />}
            </div>
            <div className={`mt-1 text-[10.5px] leading-tight truncate ${edit.look === l.id ? 'text-accent font-semibold' : 'text-muted'}`}>{l.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CompactAdjust({ edit, update }: { edit: Edit; update: Up }) {
  const t = useT();
  const [key, setKey] = useState(ADJUSTMENTS[0].key);
  const a = ADJUSTMENTS.find(x => x.key === key)!;
  const strip = useCentred(key);
  return (
    <div className="space-y-3">
      <div className="px-4 h-[54px]">
        <Slider label={t(`adj.${a.key}`, a.label)} min={a.min} max={a.max} step={a.step} value={(edit.adjust[a.key] as number) ?? 0}
          onChange={v => update(`adjust.${a.key}`, e => ({ ...e, adjust: { ...e.adjust, [a.key]: v } }))}
          format={a.key === 'exposure' ? v => `${v.toFixed(2)} EV` : undefined} />
      </div>
      <div ref={strip} className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-1">
        {ADJUSTMENTS.map(x => {
          const changed = !!edit.adjust[x.key];
          return (
            <button key={x.key} data-active={key === x.key} onClick={() => setKey(x.key)}
              className={`relative shrink-0 h-9 px-3.5 rounded-full text-[12.5px] font-medium transition ${key === x.key ? 'bg-accent text-black' : 'bg-raised text-muted'}`}>
              {t(`adj.${x.key}`, x.label)}
              {changed && key !== x.key && <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CompactFrame({ photo, edit, update, fonts }: { photo: Photo; edit: Edit; update: Up; fonts: Fonts }) {
  const thumbs = useFrameThumbs(photo, edit, fonts);
  const strip = useCentred(edit.frame.style);
  const set = <K extends keyof Edit['frame']>(k: K, v: Edit['frame'][K]) => update(`frame.${String(k)}`, e => ({ ...e, frame: { ...e.frame, [k]: v } }));
  return (
    <div>
      <div className="px-4 [&>div]:mb-2"><AspectPicker value={edit.frame.aspect} onChange={v => set('aspect', v)} /></div>
      <div ref={strip} className="flex gap-1 overflow-x-auto no-scrollbar px-3 pb-1">
        {STYLE_ORDER.map(s => (
          <div key={s} data-active={edit.frame.style === s}><FrameTile compact s={s} active={edit.frame.style === s} src={thumbs[s]} onClick={() => set('style', s)} /></div>
        ))}
      </div>
    </div>
  );
}

/** true from the `lg` breakpoint up, so desktop and phone layouts never both mount (and render thumbnails twice). */
export function useDesktop() {
  const q = '(min-width: 1024px)';
  const [on, setOn] = useState(() => typeof window !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q), fn = () => setOn(m.matches);
    m.addEventListener('change', fn); return () => m.removeEventListener('change', fn);
  }, []);
  return on;
}
