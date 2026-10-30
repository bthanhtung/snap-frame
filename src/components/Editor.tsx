'use client';
import {
  Columns2, Download, Eye, Frame, Image as ImageIcon, Info, Languages, Loader2, Moon, Plus, Redo2, SlidersHorizontal, Sparkles, Sun, Undo2, X, PenLine, CopyCheck,
} from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { isImageFile } from '@/lib/image';
import { useActive, useEditor } from '@/state/editor';
import { usePrefs } from '@/state/prefs';
import { ExportDialog } from './ExportDialog';
import { Landing } from './Landing';
import { AdjustPanel, FramePanel, InfoPanel, LooksPanel, MarkPanel } from './Panels';
import { Stage, useFonts } from './Stage';
import { Logo, Toasts, toast } from './ui';

type Tab = 'looks' | 'adjust' | 'frame' | 'info' | 'mark';

export default function Editor() {
  const t = useT();
  const fonts = useFonts();
  const { photos, activeId, importing, history, addFiles, remove, select, update, undo, redo, applyToAll } = useEditor();
  const { photo, edit } = useActive();
  const prefs = usePrefs();
  const [tab, setTab] = useState<Tab>('looks');
  const [compare, setCompare] = useState<'off' | 'hold' | 'split'>('off');
  const [exporting, setExporting] = useState(false);
  const [sheet, setSheet] = useState(true);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = useCallback((list: FileList | File[]) => {
    const files = Array.from(list).filter(isImageFile);
    if (!files.length) return toast(t('err.noImages', 'No images found'), 'error');
    addFiles(files);
  }, [addFiles, t]);

  // installable + offline (production builds only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  // drop anywhere, paste from the clipboard
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types.includes('Files')) { e.preventDefault(); setDragging(true); } };
    const leave = (e: DragEvent) => { if (!e.relatedTarget) setDragging(false); };
    const drop = (e: DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer?.files.length) add(e.dataTransfer.files); };
    const paste = (e: ClipboardEvent) => { const f = Array.from(e.clipboardData?.files ?? []); if (f.length) add(f); };
    addEventListener('dragover', over); addEventListener('dragleave', leave); addEventListener('drop', drop); addEventListener('paste', paste);
    return () => { removeEventListener('dragover', over); removeEventListener('dragleave', leave); removeEventListener('drop', drop); removeEventListener('paste', paste); };
  }, [add]);

  // shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); if (photo) setExporting(true); }
      else if (e.key === '\\' && !e.repeat) setCompare(c => (c === 'split' ? c : 'hold'));
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && photos.length > 1) {
        const i = photos.findIndex(p => p.id === activeId);
        select(photos[(i + (e.key === 'ArrowRight' ? 1 : -1) + photos.length) % photos.length].id);
      }
    };
    const up = (e: KeyboardEvent) => { if (e.key === '\\') setCompare(c => (c === 'hold' ? 'off' : c)); };
    addEventListener('keydown', down); addEventListener('keyup', up);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); };
  }, [undo, redo, photo, photos, activeId, select]);

  const input = <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden"
    onChange={e => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />;

  if (!photos.length) {
    return <>
      <Landing onPick={() => fileRef.current?.click()} onFiles={add} importing={importing > 0} />
      {input}<DropOverlay show={dragging} label={t('drop', 'Drop photos to start')} /><Toasts />
    </>;
  }

  const h = activeId ? history[activeId] : null;
  const tabs: [Tab, string, ReactNode][] = [
    ['looks', t('tab.looks', 'Film'), <Sparkles className="size-4" />],
    ['adjust', t('tab.adjust', 'Adjust'), <SlidersHorizontal className="size-4" />],
    ['frame', t('tab.frame', 'Frame'), <Frame className="size-4" />],
    ['info', t('tab.info', 'Info'), <Info className="size-4" />],
    ['mark', t('tab.mark', 'Sign'), <PenLine className="size-4" />],
  ];
  const panel = photo && edit && (
    tab === 'looks' ? <LooksPanel photo={photo} edit={edit} update={update} />
      : tab === 'adjust' ? <AdjustPanel edit={edit} update={update} />
      : tab === 'frame' ? <FramePanel edit={edit} update={update} />
      : tab === 'info' ? <InfoPanel edit={edit} update={update} />
      : <MarkPanel edit={edit} update={update} />
  );

  const film = (vertical: boolean) => (
    <div className={`flex gap-2 ${vertical ? 'flex-col p-3 overflow-y-auto' : 'px-3 py-2 overflow-x-auto'}`}>
      {photos.map(p => (
        <div key={p.id} className="relative shrink-0 group">
          <button onClick={() => select(p.id)} aria-label={p.name}
            className={`block size-16 rounded-xl overflow-hidden ring-2 transition ${p.id === activeId ? 'ring-accent' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
            <img src={p.thumbUrl} alt="" className="w-full h-full object-cover" />
          </button>
          <button onClick={() => remove(p.id)} aria-label={t('remove', 'Remove')}
            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-fg text-bg grid place-items-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition"><X className="size-3" /></button>
        </div>
      ))}
      {importing > 0 && <div className="shrink-0 size-16 rounded-xl bg-raised grid place-items-center"><Loader2 className="size-5 animate-spin text-muted" /></div>}
      <button onClick={() => fileRef.current?.click()} className="shrink-0 size-16 rounded-xl border-2 border-dashed border-line hover:border-accent text-muted hover:text-accent grid place-items-center transition" aria-label={t('add', 'Add photos')}>
        <Plus className="size-5" /></button>
    </div>
  );

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="h-14 shrink-0 flex items-center gap-1 px-3 sm:px-4 border-b border-line bg-panel">
        <Logo size={26} />
        <span className="hidden md:block ml-3 text-xs text-faint truncate max-w-[220px]">{photo?.name}</span>
        <div className="flex-1" />
        <button className="icon-btn" onClick={undo} disabled={!h?.past.length} title={`${t('undo', 'Undo')} (⌘Z)`}><Undo2 className="size-4" /></button>
        <button className="icon-btn" onClick={redo} disabled={!h?.future.length} title={`${t('redo', 'Redo')} (⇧⌘Z)`}><Redo2 className="size-4" /></button>
        <div className="w-px h-5 bg-line mx-1" />
        <button className={`icon-btn ${compare === 'hold' ? 'text-accent' : ''}`} title={`${t('compare.hold', 'Hold to see the original')} (\\)`}
          onPointerDown={() => setCompare('hold')} onPointerUp={() => setCompare('off')} onPointerLeave={() => setCompare(c => (c === 'hold' ? 'off' : c))}><Eye className="size-4" /></button>
        <button className={`icon-btn ${compare === 'split' ? 'text-accent bg-accent-soft' : ''}`} title={t('compare.split', 'Before / after split')}
          onClick={() => setCompare(c => (c === 'split' ? 'off' : 'split'))}><Columns2 className="size-4" /></button>
        <div className="w-px h-5 bg-line mx-1 hidden sm:block" />
        <button className="icon-btn hidden sm:inline-grid" onClick={() => prefs.set({ lang: prefs.lang === 'en' ? 'vi' : 'en' })} title="Language"><Languages className="size-4" /></button>
        <button className="icon-btn hidden sm:inline-grid" onClick={() => prefs.set({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })} title="Theme">
          {prefs.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
        <button className="btn-primary ml-2" onClick={() => setExporting(true)} disabled={!fonts}><Download className="size-4" /><span className="hidden sm:inline">{t('export.title', 'Export')}</span></button>
      </header>

      <div className="flex-1 min-h-0 flex">
        <aside className="hidden lg:flex flex-col w-[92px] border-r border-line bg-panel">{film(true)}</aside>

        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 checker p-4 sm:p-8">
            {photo && edit && fonts ? <Stage photo={photo} edit={edit} fonts={fonts} compare={compare} />
              : <div className="h-full grid place-items-center"><Loader2 className="size-6 animate-spin text-muted" /></div>}
          </div>
          <div className="lg:hidden border-t border-line bg-panel">{film(false)}</div>
        </main>

        {/* desktop panel */}
        <aside className="hidden lg:flex flex-col w-[360px] shrink-0 border-l border-line bg-panel">
          <nav className="grid grid-cols-5 gap-1 p-2 border-b border-line">
            {tabs.map(([k, l, i]) => <TabButton key={k} active={tab === k} onClick={() => setTab(k)} icon={i} label={l} />)}
          </nav>
          <div className="flex-1 overflow-y-auto px-4 pb-4">{panel}</div>
          {photos.length > 1 && <ApplyAll tab={tab} onApply={parts => { applyToAll(parts); toast(t('applied', 'Applied to {n} photos', { n: photos.length })); }} />}
        </aside>
      </div>

      {/* mobile: tab bar + bottom sheet */}
      <div className="lg:hidden border-t border-line bg-panel pb-[env(safe-area-inset-bottom)]">
        {sheet && <div className="max-h-[42dvh] overflow-y-auto px-4 pb-3 animate-up border-b border-line">{panel}
          {photos.length > 1 && <ApplyAll tab={tab} onApply={parts => { applyToAll(parts); toast(t('applied', 'Applied to {n} photos', { n: photos.length })); }} />}</div>}
        <nav className="grid grid-cols-5 gap-1 p-1.5">
          {tabs.map(([k, l, i]) => <TabButton key={k} active={tab === k && sheet} onClick={() => { if (tab === k) setSheet(s => !s); else { setTab(k); setSheet(true); } }} icon={i} label={l} />)}
        </nav>
      </div>

      {fonts && <ExportDialog open={exporting} onClose={() => setExporting(false)} fonts={fonts} />}
      {input}<DropOverlay show={dragging} label={t('dropMore', 'Drop to add photos')} /><Toasts />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick(): void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-fg hover:bg-raised'}`}>
      {icon}{label}
    </button>
  );
}

function ApplyAll({ tab, onApply }: { tab: Tab; onApply(parts: ('look' | 'adjust' | 'frame' | 'mark')[]): void }) {
  const t = useT();
  const parts = tab === 'looks' ? ['look'] : tab === 'adjust' ? ['adjust'] : tab === 'mark' ? ['mark'] : ['frame'];
  return (
    <div className="p-3 border-t border-line">
      <button className="btn-soft w-full" onClick={() => onApply(parts as never)}><CopyCheck className="size-4" />{t('applyAll', 'Apply this to all photos')}</button>
    </div>
  );
}

function DropOverlay({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 backdrop-blur-sm pointer-events-none">
      <div className="animate-in rounded-3xl border-2 border-dashed border-accent px-12 py-10 text-center bg-panel/80">
        <ImageIcon className="size-10 text-accent mx-auto" /><p className="mt-3 font-semibold">{label}</p>
      </div>
    </div>
  );
}
