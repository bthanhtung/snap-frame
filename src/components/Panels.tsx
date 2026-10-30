'use client';
import { Bookmark, ImagePlus, RotateCcw, Trash2, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FIELDS, STYLES, type Aspect, type Field, type FontKind, type FrameStyle, type MarkPos, type TextLayout } from '@/lib/frame';
import { renderer } from '@/lib/gl';
import { useT } from '@/lib/i18n';
import { downscale } from '@/lib/image';
import { ADJUSTMENTS, BRANDS, LOOKS, resolveGrade, type Brand } from '@/lib/looks';
import { useEditor, type Edit, type Photo } from '@/state/editor';
import { Section, Segmented, Slider, toast } from './ui';

type Up = (key: string, fn: (e: Edit) => Edit) => void;

// ---------- Looks ----------
const thumbCache = new Map<string, string>();
function useLookThumbs(photo: Photo) {
  const [, force] = useState(0);
  useEffect(() => {
    let alive = true;
    const todo = [null, ...LOOKS.map(l => l.id)].filter(id => !thumbCache.has(`${photo.id}:${id}`));
    const step = () => {
      if (!alive || !todo.length) return;
      const gl = renderer();
      for (const id of todo.splice(0, 4)) {
        gl.setSource(photo.thumb, `thumb:${photo.id}`);
        const c = gl.render(resolveGrade(id, 1, {}), photo.thumb.width, photo.thumb.height, 0.2);
        thumbCache.set(`${photo.id}:${id}`, c.toDataURL('image/jpeg', 0.82));
      }
      force(x => x + 1);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { alive = false; };
  }, [photo]);
  return (id: string | null) => thumbCache.get(`${photo.id}:${id}`);
}

export function LooksPanel({ photo, edit, update }: { photo: Photo; edit: Edit; update: Up }) {
  const t = useT();
  const thumb = useLookThumbs(photo);
  const [brand, setBrand] = useState<Brand | 'all'>('all');
  const [naming, setNaming] = useState<string | null>(null);
  const { presets, savePreset, applyPreset, deletePreset } = useEditor();
  const list = LOOKS.filter(l => brand === 'all' || l.brand === brand);
  const current = LOOKS.find(l => l.id === edit.look);
  const Tile = ({ id, name, note }: { id: string | null; name: string; note?: string }) => (
    <button onClick={() => update('look', e => ({ ...e, look: id }))} title={note}
      className={`group text-left rounded-xl overflow-hidden ring-2 transition ${edit.look === id ? 'ring-accent' : 'ring-transparent hover:ring-line'}`}>
      <div className="aspect-[4/3] bg-raised overflow-hidden">
        {thumb(id) ? <img src={thumb(id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full animate-pulse" />}
      </div>
      <div className={`px-2 py-1.5 text-[12px] font-medium truncate ${edit.look === id ? 'text-accent' : ''}`}>{name}</div>
    </button>
  );
  return <>
    <Section title={current ? current.name : t('looks.none', 'Original')}>
      {current && <p className="text-xs text-muted -mt-1.5 mb-3">{current.note}</p>}
      <Slider label={t('looks.strength', 'Strength')} value={edit.strength} min={0} max={1} step={0.01} reset={1}
        onChange={v => update('strength', e => ({ ...e, strength: v }))} format={v => `${Math.round(v * 100)}%`} />
    </Section>
    <div className="flex gap-1.5 py-3 overflow-x-auto -mx-1 px-1">
      {(['all', ...BRANDS] as const).map(b => (
        <button key={b} onClick={() => setBrand(b)} className={`shrink-0 h-7 px-3 rounded-full text-xs font-medium transition ${brand === b ? 'bg-fg text-bg' : 'bg-raised text-muted hover:text-fg'}`}>
          {b === 'all' ? t('looks.all', 'All') : b}</button>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2 pb-3">
      {brand === 'all' && <Tile id={null} name={t('looks.none', 'Original')} />}
      {list.map(l => <Tile key={l.id} id={l.id} name={l.name} note={l.note} />)}
    </div>
    <Section title={t('presets.title', 'My presets')} action={<button className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
      onClick={() => setNaming(current?.name ?? '')}>
      <Bookmark className="size-3.5" />{t('presets.save', 'Save current')}</button>}>
      {naming !== null && <form className="flex gap-2 mb-3" onSubmit={e => { e.preventDefault(); savePreset(naming); setNaming(null); toast(t('presets.saved', 'Preset saved')); }}>
        <input className="field h-8 text-[13px]" autoFocus value={naming} onChange={e => setNaming(e.target.value)} placeholder={t('presets.name', 'Name this preset')} maxLength={40} />
        <button className="btn-primary h-8">{t('common.save', 'Save')}</button>
      </form>}
      {presets.length === 0 ? <p className="text-xs text-faint">{t('presets.empty', 'Save a look + frame combination to reuse it in one tap.')}</p>
        : <div className="space-y-1">{presets.map(p => (
          <div key={p.id} className="flex items-center gap-2 group">
            <button className="flex-1 text-left text-[13px] h-8 px-2.5 rounded-lg hover:bg-raised truncate" onClick={() => applyPreset(p.id)}>{p.name}</button>
            <button className="icon-btn size-8 opacity-0 group-hover:opacity-100" aria-label="Delete" onClick={() => deletePreset(p.id)}><Trash2 className="size-3.5" /></button>
          </div>))}</div>}
    </Section>
    <p className="text-[10px] text-faint pt-2 leading-relaxed">{t('looks.disclaimer', 'Looks are inspired by classic film stocks and are not affiliated with or endorsed by their makers.')}</p>
  </>;
}

// ---------- Adjust ----------
export function AdjustPanel({ edit, update }: { edit: Edit; update: Up }) {
  const t = useT();
  const groups: [string, string[]][] = [
    [t('adj.light', 'Light'), ['exposure', 'contrast', 'highlights', 'shadows']],
    [t('adj.color', 'Colour'), ['temperature', 'tint', 'saturation', 'vibrance']],
    [t('adj.effects', 'Effects'), ['fade', 'grain', 'vignette', 'halation', 'sharpen']],
  ];
  const dirty = Object.values(edit.adjust).some(v => v);
  return <>
    {groups.map(([title, keys]) => (
      <Section key={title} title={title} action={title === groups[0][0] && dirty ? <button className="text-xs text-accent inline-flex items-center gap-1" onClick={() => update('adjust.reset', e => ({ ...e, adjust: {} }))}>
        <RotateCcw className="size-3" />{t('adj.reset', 'Reset all')}</button> : undefined}>
        <div className="space-y-2.5">
          {ADJUSTMENTS.filter(a => keys.includes(a.key)).map(a => (
            <Slider key={a.key} label={t(`adj.${a.key}`, a.label)} min={a.min} max={a.max} step={a.step}
              value={(edit.adjust[a.key] as number) ?? 0}
              onChange={v => update(`adjust.${a.key}`, e => ({ ...e, adjust: { ...e.adjust, [a.key]: v } }))}
              format={a.key === 'exposure' ? v => `${v.toFixed(2)} EV` : undefined} />
          ))}
        </div>
      </Section>
    ))}
    <p className="text-[11px] text-faint pt-2">{t('adj.hint', 'Adjustments stack on top of the look. Double-click a slider to reset it.')}</p>
  </>;
}

// ---------- Frame ----------
const SWATCHES = [null, '#ffffff', '#f6f1e9', '#e9e4da', '#d7d2c8', '#1c1c1e', '#0b0b0c', '#2f3b2f', '#8a5a44', '#1e2a44', '#c94f3d'];
const STYLE_ORDER: FrameStyle[] = ['white', 'black', 'leica', 'gallery', 'polaroid', 'instax', 'filmstrip', 'slide', 'darkroom', 'fuji', 'blur', 'datestamp', 'none'];
const ASPECTS: Aspect[] = ['original', '1:1', '4:5', '9:16', '3:2', '16:9'];

function StyleSwatch({ s }: { s: FrameStyle }) {
  const d = STYLES[s];
  const [t, r, b, l] = d.pad.map(p => p * 3);
  const bg = s === 'blur' ? 'linear-gradient(135deg,#7c6a8a,#d79a6a)' : d.bg;
  return (
    <div className="aspect-square rounded-lg grid place-items-center overflow-hidden border border-line" style={{ background: bg }}>
      <div className="w-[64%] relative" style={{ padding: `${t}px ${r}px ${b}px ${l}px`, background: s === 'blur' ? 'transparent' : d.bg }}>
        <div className="aspect-[4/3] rounded-[2px] bg-gradient-to-br from-[#6d8fb3] via-[#c9a27a] to-[#e3735e]" />
        {s === 'filmstrip' && <div className="absolute inset-x-0 top-0.5 h-1 bg-[repeating-linear-gradient(90deg,#ddd_0_3px,transparent_3px_6px)]" />}
        {s === 'datestamp' && <span className="absolute right-1.5 bottom-1 text-[6px] font-mono text-orange-400">'26 10</span>}
        {b > 5 && <div className="absolute left-1.5 right-1.5" style={{ bottom: b / 3 }}><div className="h-[3px] w-1/2 rounded bg-current opacity-40" style={{ color: d.text }} /></div>}
      </div>
    </div>
  );
}

export function FramePanel({ edit, update }: { edit: Edit; update: Up }) {
  const t = useT();
  const f = edit.frame;
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => update(`frame.${String(k)}`, e => ({ ...e, frame: { ...e.frame, [k]: v } }));
  return <>
    <Section title={t('frame.style', 'Style')}>
      <div className="grid grid-cols-4 gap-2">
        {STYLE_ORDER.map(s => (
          <button key={s} onClick={() => set('style', s)} className={`rounded-xl p-1 transition ring-2 ${f.style === s ? 'ring-accent' : 'ring-transparent hover:ring-line'}`}>
            <StyleSwatch s={s} />
            <div className={`text-[11px] mt-1 truncate ${f.style === s ? 'text-accent font-medium' : 'text-muted'}`}>{t(`style.${s}`, STYLES[s].label)}</div>
          </button>
        ))}
      </div>
    </Section>
    <Section title={t('frame.canvas', 'Canvas')}>
      <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-raised mb-3">
        {ASPECTS.map(a => <button key={a} onClick={() => set('aspect', a)} className={`h-8 rounded-lg text-[11px] font-medium ${f.aspect === a ? 'bg-panel text-fg shadow-sm' : 'text-muted'}`}>
          {a === 'original' ? t('frame.orig', 'Orig') : a}</button>)}
      </div>
      <div className="space-y-2.5">
        <Slider label={t('frame.padding', 'Margin')} value={f.padding} min={0.4} max={2.2} step={0.02} reset={1} onChange={v => set('padding', v)} format={v => `${Math.round(v * 100)}%`} />
        <Slider label={t('frame.radius', 'Rounded corners')} value={f.radius} min={0} max={1} step={0.01} onChange={v => set('radius', v)} />
        <Slider label={t('frame.shadow', 'Shadow')} value={f.shadow} min={0} max={1} step={0.01} onChange={v => set('shadow', v)} />
        <Slider label={t('frame.border', 'Border')} value={f.border} min={0} max={1} step={0.01} onChange={v => set('border', v)} />
      </div>
    </Section>
    <Section title={t('frame.bg', 'Background')}>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map(c => (
          <button key={String(c)} onClick={() => set('bg', c)} aria-label={c ?? 'auto'} title={c ?? t('frame.auto', 'Style default')}
            className={`size-8 rounded-full border border-line grid place-items-center text-[9px] font-semibold transition ${f.bg === c ? 'ring-2 ring-accent ring-offset-2 ring-offset-panel' : ''}`}
            style={{ background: c ?? 'conic-gradient(#fff 0 25%,#111 0 50%,#fff 0 75%,#111 0)' }}>{c === null && <span className="bg-panel/80 rounded px-0.5">A</span>}</button>
        ))}
        <label className="size-8 rounded-full border border-dashed border-line grid place-items-center cursor-pointer text-faint text-xs" title={t('frame.custom', 'Custom colour')}>
          +<input type="color" className="sr-only" value={f.bg ?? '#ffffff'} onChange={e => set('bg', e.target.value)} />
        </label>
      </div>
    </Section>
    <Section title={t('frame.text', 'Caption')}>
      <div className="space-y-2.5">
        <Segmented<TextLayout> value={f.layout} onChange={v => set('layout', v)} size="sm"
          options={[{ value: 'split', label: t('frame.split', 'Split') }, { value: 'center', label: t('frame.center', 'Centre') }, { value: 'left', label: t('frame.left', 'Left') }, { value: 'none', label: t('frame.hide', 'Hide') }]} />
        <Segmented<FontKind> value={f.font} onChange={v => set('font', v)} size="sm"
          options={[{ value: 'sans', label: <span className="font-sans">Sans</span> }, { value: 'serif', label: <span className="font-serif">Serif</span> }, { value: 'mono', label: <span className="font-mono">Mono</span> }, { value: 'script', label: <span style={{ fontFamily: 'var(--font-caveat)' }} className="text-sm">Script</span> }]} />
        <Segmented<'bottom' | 'top'> value={f.textPos} onChange={v => set('textPos', v)} size="sm"
          options={[{ value: 'bottom', label: t('frame.bottom', 'Bottom') }, { value: 'top', label: t('frame.top', 'Top') }]} />
      </div>
    </Section>
  </>;
}

// ---------- Info (metadata) ----------
export function InfoPanel({ edit, update }: { edit: Edit; update: Up }) {
  const t = useT();
  const labels: Record<Field, string> = {
    camera: t('meta.camera', 'Camera'), lens: t('meta.lens', 'Lens'), focal: t('meta.focal', 'Focal length'), aperture: t('meta.aperture', 'Aperture'),
    shutter: t('meta.shutter', 'Shutter'), iso: 'ISO', date: t('meta.date', 'Date'), location: t('meta.location', 'Location'), author: t('meta.author', 'Author'),
  };
  const toggle = (k: Field, on: boolean) => update(`fields.${k}`, e => ({ ...e, frame: { ...e.frame, fields: on ? FIELDS.filter(x => x === k || e.frame.fields.includes(x)) : e.frame.fields.filter(x => x !== k) } }));
  return <>
    <Section title={t('meta.title', 'Photo details')}>
      <p className="text-xs text-muted -mt-1 mb-3">{t('meta.hint', 'Read from the photo’s EXIF. Edit anything, tick what to print on the frame.')}</p>
      <div className="space-y-2">
        {FIELDS.map(k => (
          <div key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={edit.frame.fields.includes(k)} onChange={e => toggle(k, e.target.checked)} aria-label={`Show ${labels[k]}`}
              className="size-4 shrink-0 accent-[var(--accent)]" />
            <div className="flex-1 min-w-0">
              <input className="field h-8 text-[13px]" placeholder={labels[k]} value={edit.meta[k]}
                onChange={e => update(`meta.${k}`, x => ({ ...x, meta: { ...x.meta, [k]: e.target.value } }))} />
            </div>
          </div>
        ))}
      </div>
    </Section>
    <p className="text-[11px] text-faint pt-2">{t('meta.privacy', 'GPS coordinates are never read or exported.')}</p>
  </>;
}

// ---------- Signature / watermark ----------
const POSITIONS: MarkPos[] = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
export function MarkPanel({ edit, update }: { edit: Edit; update: Up }) {
  const t = useT();
  const m = edit.mark;
  const set = <K extends keyof typeof m>(k: K, v: (typeof m)[K]) => update(`mark.${String(k)}`, e => ({ ...e, mark: { ...e.mark, [k]: v } }));
  const fileRef = useRef<HTMLInputElement>(null);
  async function pickLogo(file: File) {
    const bmp = await createImageBitmap(file);
    const c = downscale(bmp, 900); bmp.close();
    set('logo', c.toDataURL('image/png')); set('kind', 'logo');
  }
  return <>
    <Section title={t('mark.title', 'Signature')}>
      <Segmented value={m.kind} onChange={v => set('kind', v)} options={[
        { value: 'none', label: t('mark.none', 'None') }, { value: 'text', label: <><Type className="size-3.5" />{t('mark.text', 'Text')}</> },
        { value: 'logo', label: <><ImagePlus className="size-3.5" />{t('mark.logo', 'Logo')}</> }]} />
      {m.kind === 'text' && <div className="mt-3 space-y-2.5">
        <input className="field" placeholder={t('mark.placeholder', '© Your name')} value={m.text} onChange={e => set('text', e.target.value)} maxLength={60} />
        <Segmented<FontKind> value={m.font} onChange={v => set('font', v)} size="sm"
          options={[{ value: 'script', label: <span style={{ fontFamily: 'var(--font-caveat)' }} className="text-sm">Script</span> }, { value: 'sans', label: 'Sans' }, { value: 'serif', label: <span className="font-serif">Serif</span> }, { value: 'mono', label: <span className="font-mono">Mono</span> }]} />
        <div className="flex gap-2">{['#ffffff', '#111111', '#ff8a3d', '#f5d08a'].map(c => (
          <button key={c} onClick={() => set('color', c)} className={`size-7 rounded-full border border-line ${m.color === c ? 'ring-2 ring-accent ring-offset-2 ring-offset-panel' : ''}`} style={{ background: c }} aria-label={c} />))}</div>
      </div>}
      {m.kind === 'logo' && <div className="mt-3">
        <button className="w-full h-20 rounded-xl border border-dashed border-line hover:border-accent grid place-items-center text-xs text-muted" onClick={() => fileRef.current?.click()}>
          {m.logo ? <img src={m.logo} alt="" className="max-h-14 max-w-[80%] object-contain" /> : t('mark.upload', 'Upload a PNG logo (transparent works best)')}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickLogo(e.target.files[0])} />
      </div>}
    </Section>
    {m.kind !== 'none' && <Section title={t('mark.placement', 'Placement')}>
      <div className="grid grid-cols-3 gap-1.5 w-32 mb-4">
        {POSITIONS.map(p => <button key={p} onClick={() => set('pos', p)} aria-label={p}
          className={`h-8 rounded-lg border transition ${m.pos === p ? 'bg-accent border-accent' : 'border-line hover:bg-raised'}`} />)}
      </div>
      <div className="space-y-2.5">
        <Slider label={t('mark.size', 'Size')} value={m.size} min={0.05} max={0.5} step={0.01} reset={0.18} onChange={v => set('size', v)} format={v => `${Math.round(v * 100)}%`} />
        <Slider label={t('mark.opacity', 'Opacity')} value={m.opacity} min={0.1} max={1} step={0.01} reset={0.85} onChange={v => set('opacity', v)} format={v => `${Math.round(v * 100)}%`} />
      </div>
    </Section>}
  </>;
}

