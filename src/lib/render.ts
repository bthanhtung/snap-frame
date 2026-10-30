import { compose, type Fonts } from './frame';
import { renderer } from './gl';
import { decode, downscale } from './image';
import { LOOKS, resolveGrade } from './looks';
import type { Edit, Photo } from '@/state/editor';

export type ExportFormat = 'jpeg' | 'png' | 'webp';
export interface ExportOptions { format: ExportFormat; quality: number; maxEdge: number | null }

// iOS Safari refuses canvases above ~16.7 MP; desktop browsers handle much more.
const isIOS = () => typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const MAX_AREA = () => (isIOS() ? 16_000_000 : 40_000_000);

const logoCache = new Map<string, Promise<ImageBitmap>>();
export function logoBitmap(dataUrl: string | null) {
  if (!dataUrl) return Promise.resolve(null);
  if (!logoCache.has(dataUrl)) logoCache.set(dataUrl, fetch(dataUrl).then(r => r.blob()).then(b => createImageBitmap(b)));
  return logoCache.get(dataUrl)!;
}

/** Grades + frames a source image into `out` (or a new canvas). Used for preview and export alike. */
export function renderTo(src: TexImageSource & { width: number; height: number }, key: unknown, edit: Edit, fonts: Fonts,
  logo: ImageBitmap | null, out?: HTMLCanvasElement, opts: { neutral?: boolean } = {}) {
  const gl = renderer();
  gl.setSource(src, key);
  const grade = resolveGrade(opts.neutral ? null : edit.look, edit.strength, opts.neutral ? {} : edit.adjust);
  const graded = gl.render(grade, src.width, src.height);
  return compose({ photo: graded, frame: edit.frame, meta: edit.meta, mark: edit.mark, logo, fonts, lookName: LOOKS.find(l => l.id === edit.look)?.name }, out);
}

/** Full-resolution export from the original file. */
export async function exportPhoto(photo: Photo, edit: Edit, fonts: Fonts, o: ExportOptions): Promise<Blob> {
  const bmp = await decode(photo.file);
  try {
    const gl = renderer();
    let edge = Math.max(bmp.width, bmp.height);
    if (o.maxEdge) edge = Math.min(edge, o.maxEdge);
    edge = Math.min(edge, gl.maxSize, Math.floor(Math.sqrt(MAX_AREA() * Math.max(bmp.width, bmp.height) / Math.min(bmp.width, bmp.height)) * 0.82));
    const src = edge < Math.max(bmp.width, bmp.height) ? downscale(bmp, edge) : bmp;
    const canvas = renderTo(src, Symbol('export'), edit, fonts, await logoBitmap(edit.mark.logo));
    const type = `image/${o.format}`;
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, type, o.format === 'png' ? undefined : o.quality));
    if (!blob) throw new Error('Could not encode the image (it may be too large for this device)');
    canvas.width = canvas.height = 0;
    return blob;
  } finally { bmp.close(); }
}

export function fileName(photo: Photo, format: ExportFormat, suffix = 'snapframe') {
  const base = photo.name.replace(/\.[^.]+$/, '');
  return `${base}-${suffix}.${format === 'jpeg' ? 'jpg' : format}`;
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function zipBlobs(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const { zip } = await import('fflate');
  const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
  const used = new Set<string>();
  for (const f of files) {
    let n = f.name, i = 2;
    while (used.has(n)) n = f.name.replace(/(\.\w+)$/, `-${i++}$1`);
    used.add(n);
    entries[n] = [new Uint8Array(await f.blob.arrayBuffer()), { level: 0 }];   // images are already compressed
  }
  return new Promise((res, rej) => zip(entries, (err, data) => (err ? rej(err) : res(new Blob([data as BlobPart], { type: 'application/zip' })))));
}

export const canShareFiles = (files: File[]) => typeof navigator !== 'undefined' && !!navigator.canShare?.({ files });
