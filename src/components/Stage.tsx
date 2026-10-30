'use client';
import { useEffect, useRef, useState } from 'react';
import type { Fonts } from '@/lib/frame';
import { logoBitmap, renderTo } from '@/lib/render';
import { useT } from '@/lib/i18n';
import type { Edit, Photo } from '@/state/editor';

/** Resolves the next/font families (exposed as CSS variables) and waits until canvas can use them. */
export function useFonts(): Fonts | null {
  const [fonts, setFonts] = useState<Fonts | null>(null);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const v = (n: string, fb: string) => css.getPropertyValue(n).trim() || fb;
    const f: Fonts = {
      sans: v('--font-inter', 'system-ui, sans-serif'), serif: v('--font-fraunces', 'Georgia, serif'),
      mono: v('--font-jetbrains', 'ui-monospace, monospace'), script: v('--font-caveat', 'cursive'),
    };
    Promise.all(Object.values(f).flatMap(fam => ['400', '600'].map(w => document.fonts.load(`${w} 32px ${fam}`).catch(() => null))))
      .finally(() => setFonts(f));
  }, []);
  return fonts;
}

export function Stage({ photo, edit, fonts, compare }: { photo: Photo; edit: Edit; fonts: Fonts; compare: 'off' | 'hold' | 'split' }) {
  const t = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const before = useRef<HTMLCanvasElement | null>(null);
  const [split, setSplit] = useState(0.5);
  const raf = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    let alive = true;
    raf.current = requestAnimationFrame(async () => {
      const logo = edit.mark.kind === 'logo' ? await logoBitmap(edit.mark.logo) : null;
      if (!alive || !canvas.current) return;
      const c = canvas.current;
      if (compare === 'hold') { renderTo(photo.preview, photo.id, edit, fonts, logo, c, { neutral: true }); return; }
      renderTo(photo.preview, photo.id, edit, fonts, logo, c);
      if (compare === 'split') {
        before.current ??= document.createElement('canvas');
        const b = renderTo(photo.preview, photo.id, edit, fonts, logo, before.current, { neutral: true });
        const ctx = c.getContext('2d')!, x = Math.round(c.width * split);
        ctx.drawImage(b, 0, 0, x, b.height, 0, 0, x, b.height);
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, 0, 2, c.height);
      }
    });
    return () => { alive = false; cancelAnimationFrame(raf.current); };
  }, [photo, edit, fonts, compare, split]);

  return (
    <div className="relative w-full h-full grid place-items-center select-none"
      onPointerMove={e => { if (compare === 'split' && e.buttons) { const r = canvas.current!.getBoundingClientRect(); setSplit(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); } }}
      onPointerDown={e => { if (compare === 'split') { const r = canvas.current!.getBoundingClientRect(); setSplit(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); } }}>
      <canvas ref={canvas} className="max-w-full max-h-full object-contain rounded-sm shadow-[0_30px_80px_-20px_rgb(0_0_0/.6)]" style={{ cursor: compare === 'split' ? 'ew-resize' : 'default' }} />
      {compare !== 'off' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 text-[11px] font-semibold uppercase tracking-wider pointer-events-none">
          {compare === 'split' ? <><span className="px-2 py-1 rounded-md bg-black/60 text-white">{t('stage.before', 'Before')}</span><span className="px-2 py-1 rounded-md bg-black/60 text-white">{t('stage.after', 'After')}</span></>
            : <span className="px-2 py-1 rounded-md bg-black/60 text-white">{t('stage.original', 'Original')}</span>}
        </div>
      )}
    </div>
  );
}
