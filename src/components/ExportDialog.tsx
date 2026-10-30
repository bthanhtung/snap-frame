'use client';
import { Download, Loader2, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Fonts } from '@/lib/frame';
import { useT } from '@/lib/i18n';
import { canShareFiles, download, exportPhoto, fileName, zipBlobs, type ExportFormat } from '@/lib/render';
import { useEditor } from '@/state/editor';
import { Segmented, Slider, toast } from './ui';

const KEY = 'sf_export';
interface Opts { format: ExportFormat; quality: number; size: 'full' | '4096' | '2048' | '1080'; scope: 'one' | 'all' }

export function ExportDialog({ open, onClose, fonts }: { open: boolean; onClose(): void; fonts: Fonts }) {
  const t = useT();
  const { photos, edits, activeId } = useEditor();
  const [o, setO] = useState<Opts>({ format: 'jpeg', quality: 0.92, size: 'full', scope: 'one' });
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  useEffect(() => { try { setO(x => ({ ...x, ...JSON.parse(localStorage.getItem(KEY) || '{}'), scope: 'one' })); } catch { /* ignore */ } }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open, busy, onClose]);
  if (!open) return null;
  const set = (p: Partial<Opts>) => { const n = { ...o, ...p }; setO(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const targets = o.scope === 'all' ? photos : photos.filter(p => p.id === activeId);
  const opts = { format: o.format, quality: o.quality, maxEdge: o.size === 'full' ? null : Number(o.size) };

  async function render() {
    const out: { name: string; blob: Blob }[] = [];
    setBusy({ done: 0, total: targets.length });
    for (const p of targets) {
      out.push({ name: fileName(p, o.format), blob: await exportPhoto(p, edits[p.id], fonts, opts) });
      setBusy({ done: out.length, total: targets.length });
    }
    return out;
  }
  async function save() {
    try {
      const files = await render();
      if (files.length === 1) download(files[0].blob, files[0].name);
      else download(await zipBlobs(files), `snapframe-${new Date().toISOString().slice(0, 10)}.zip`);
      toast(t('export.done', 'Saved {n} photo(s)', { n: files.length }));
      onClose();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(null); }
  }
  async function share() {
    try {
      const files = (await render()).map(f => new File([f.blob], f.name, { type: f.blob.type }));
      await navigator.share({ files });
      onClose();
    } catch (e) { if ((e as Error).name !== 'AbortError') toast((e as Error).message, 'error'); } finally { setBusy(null); }
  }
  const shareable = typeof navigator !== 'undefined' && canShareFiles([new File([''], 'x.jpg', { type: 'image/jpeg' })]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/55 backdrop-blur-sm p-0 sm:p-4" onMouseDown={e => e.target === e.currentTarget && !busy && onClose()}>
      <div role="dialog" aria-modal="true" className="animate-in w-full sm:max-w-md bg-panel rounded-t-3xl sm:rounded-3xl border border-line shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{t('export.title', 'Export')}</h2>
          <button className="icon-btn" onClick={onClose} disabled={!!busy} aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="space-y-4">
          {photos.length > 1 && <Segmented value={o.scope} onChange={v => set({ scope: v })}
            options={[{ value: 'one', label: t('export.this', 'This photo') }, { value: 'all', label: t('export.all', 'All {n} photos (.zip)', { n: photos.length }) }]} />}
          <div><div className="label mb-2">{t('export.format', 'Format')}</div>
            <Segmented value={o.format} onChange={v => set({ format: v })} options={[{ value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }]} /></div>
          {o.format !== 'png' && <Slider label={t('export.quality', 'Quality')} value={o.quality} min={0.6} max={1} step={0.01} reset={0.92} onChange={v => set({ quality: v })} format={v => `${Math.round(v * 100)}`} />}
          <div><div className="label mb-2">{t('export.size', 'Long edge')}</div>
            <Segmented value={o.size} onChange={v => set({ size: v })} size="sm"
              options={[{ value: 'full', label: t('export.full', 'Full') }, { value: '4096', label: '4096' }, { value: '2048', label: '2048' }, { value: '1080', label: '1080' }]} /></div>
          <p className="text-xs text-faint">{t('export.local', 'Rendered on your device from the original file. Nothing is uploaded.')}</p>
        </div>
        <div className="mt-6 flex gap-2">
          {shareable && <button className="btn-soft flex-1 h-11" disabled={!!busy} onClick={share}><Share2 className="size-4" />{t('export.share', 'Share')}</button>}
          <button className="btn-primary flex-[2] h-11" disabled={!!busy} onClick={save}>
            {busy ? <><Loader2 className="size-4 animate-spin" />{busy.total > 1 ? `${busy.done}/${busy.total}` : t('export.rendering', 'Rendering…')}</> : <><Download className="size-4" />{t('export.save', 'Save')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
