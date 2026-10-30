'use client';
import { create } from 'zustand';
import { DEFAULT_FRAME, DEFAULT_MARK, type FrameSettings, type MarkSettings, type Meta } from '@/lib/frame';
import { decode, downscale, PREVIEW_EDGE, readMeta, THUMB_EDGE } from '@/lib/image';
import type { Grade } from '@/lib/looks';

export interface Photo {
  id: string;
  name: string;
  file: File;
  width: number;            // original, orientation-corrected
  height: number;
  preview: HTMLCanvasElement;
  thumb: HTMLCanvasElement;
  thumbUrl: string;
}

export interface Edit {
  look: string | null;
  strength: number;
  adjust: Partial<Grade>;
  frame: FrameSettings;
  meta: Meta;
  mark: MarkSettings;
}

export interface UserPreset { id: string; name: string; edit: Omit<Edit, 'meta'> }

const EMPTY_META: Meta = { camera: '', lens: '', focal: '', aperture: '', shutter: '', iso: '', date: '', location: '', author: '' };
const LS = { defaults: 'sf_defaults', presets: 'sf_presets' };
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota / private mode */ } };

const baseEdit = (): Omit<Edit, 'meta'> => ({ look: 'portra400', strength: 1, adjust: {}, frame: { ...DEFAULT_FRAME }, mark: { ...DEFAULT_MARK } });

interface History { past: Edit[]; future: Edit[]; lastKey: string; lastAt: number }

interface EditorState {
  photos: Photo[];
  edits: Record<string, Edit>;
  history: Record<string, History>;
  activeId: string | null;
  importing: number;
  presets: UserPreset[];
  addFiles(files: File[]): Promise<void>;
  remove(id: string): void;
  select(id: string): void;
  /** Applies a change to the active photo; rapid changes with the same key merge into one undo step. */
  update(key: string, fn: (e: Edit) => Edit): void;
  undo(): void;
  redo(): void;
  applyToAll(parts: ('look' | 'adjust' | 'frame' | 'mark')[]): void;
  savePreset(name: string): void;
  deletePreset(id: string): void;
  applyPreset(id: string): void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useEditor = create<EditorState>((set, get) => ({
  photos: [], edits: {}, history: {}, activeId: null, importing: 0,
  presets: typeof window === 'undefined' ? [] : load<UserPreset[]>(LS.presets, []),

  async addFiles(files) {
    set(s => ({ importing: s.importing + files.length }));
    for (const file of files) {
      try {
        const [bmp, meta] = await Promise.all([decode(file), readMeta(file)]);
        const preview = downscale(bmp, PREVIEW_EDGE);
        const thumb = downscale(preview, THUMB_EDGE);
        const photo: Photo = { id: uid(), name: file.name, file, width: bmp.width, height: bmp.height, preview, thumb, thumbUrl: thumb.toDataURL('image/jpeg', 0.8) };
        bmp.close();
        const defaults = load<Omit<Edit, 'meta'> | null>(LS.defaults, null) ?? baseEdit();
        const edit: Edit = { ...baseEdit(), ...defaults, frame: { ...DEFAULT_FRAME, ...defaults.frame }, mark: { ...DEFAULT_MARK, ...defaults.mark }, meta: { ...EMPTY_META, ...meta, author: meta.author || load<string>('sf_author', '') } };
        set(s => ({
          photos: [...s.photos, photo], edits: { ...s.edits, [photo.id]: edit },
          history: { ...s.history, [photo.id]: { past: [], future: [], lastKey: '', lastAt: 0 } },
          activeId: s.activeId ?? photo.id,
        }));
      } catch (e) {
        console.warn('Could not open', file.name, e);
        window.dispatchEvent(new CustomEvent('sf:toast', { detail: { kind: 'error', text: `Could not open ${file.name}` } }));
      } finally {
        set(s => ({ importing: s.importing - 1 }));
      }
    }
  },

  remove(id) {
    set(s => {
      const photos = s.photos.filter(p => p.id !== id);
      const { [id]: _e, ...edits } = s.edits;
      const { [id]: _h, ...history } = s.history;
      const idx = s.photos.findIndex(p => p.id === id);
      const activeId = s.activeId === id ? (photos[Math.min(idx, photos.length - 1)]?.id ?? null) : s.activeId;
      return { photos, edits, history, activeId };
    });
  },

  select: id => set({ activeId: id }),

  update(key, fn) {
    const { activeId, edits, history } = get();
    if (!activeId) return;
    const before = edits[activeId];
    const after = fn(before);
    const h = history[activeId];
    const now = Date.now();
    const merge = h.lastKey === key && now - h.lastAt < 800;
    const past = merge ? h.past : [...h.past, before].slice(-60);
    set({ edits: { ...edits, [activeId]: after }, history: { ...history, [activeId]: { past, future: [], lastKey: key, lastAt: now } } });
    // new photos start from the most recent look & frame
    const { meta: _m, ...rest } = after;
    save(LS.defaults, rest);
    if (key.startsWith('meta.author')) save('sf_author', after.meta.author);
  },

  undo() {
    const { activeId, edits, history } = get();
    if (!activeId) return;
    const h = history[activeId];
    if (!h.past.length) return;
    const prev = h.past[h.past.length - 1];
    set({ edits: { ...edits, [activeId]: prev }, history: { ...history, [activeId]: { past: h.past.slice(0, -1), future: [edits[activeId], ...h.future], lastKey: '', lastAt: 0 } } });
  },

  redo() {
    const { activeId, edits, history } = get();
    if (!activeId) return;
    const h = history[activeId];
    if (!h.future.length) return;
    const [next, ...future] = h.future;
    set({ edits: { ...edits, [activeId]: next }, history: { ...history, [activeId]: { past: [...h.past, edits[activeId]], future, lastKey: '', lastAt: 0 } } });
  },

  applyToAll(parts) {
    const { activeId, edits, history } = get();
    if (!activeId) return;
    const src = edits[activeId];
    const next = { ...edits }, hist = { ...history };
    for (const id of Object.keys(edits)) {
      if (id === activeId) continue;
      const e = { ...edits[id] };
      if (parts.includes('look')) { e.look = src.look; e.strength = src.strength; }
      if (parts.includes('adjust')) e.adjust = { ...src.adjust };
      if (parts.includes('frame')) e.frame = { ...src.frame, fields: [...src.frame.fields] };
      if (parts.includes('mark')) e.mark = { ...src.mark };
      hist[id] = { ...hist[id], past: [...hist[id].past, edits[id]].slice(-60), future: [] };
      next[id] = e;
    }
    set({ edits: next, history: hist });
  },

  savePreset(name) {
    const { activeId, edits, presets } = get();
    if (!activeId) return;
    const { meta: _m, ...edit } = edits[activeId];
    const list = [...presets, { id: uid(), name: name.trim() || `Preset ${presets.length + 1}`, edit: structuredClone(edit) }];
    set({ presets: list }); save(LS.presets, list);
  },
  deletePreset(id) { const list = get().presets.filter(p => p.id !== id); set({ presets: list }); save(LS.presets, list); },
  applyPreset(id) {
    const p = get().presets.find(x => x.id === id);
    if (p) get().update(`preset.${id}`, e => ({ ...e, ...structuredClone(p.edit) }));
  },
}));

/** Active photo and its edit (two selectors so each returns a stable reference). */
export function useActive() {
  const photo = useEditor(s => s.photos.find(p => p.id === s.activeId) ?? null);
  const edit = useEditor(s => (s.activeId ? s.edits[s.activeId] ?? null : null));
  return { photo, edit };
}
