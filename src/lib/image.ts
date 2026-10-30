import type { Meta } from './frame';

export const PREVIEW_EDGE = 1800;
export const THUMB_EDGE = 220;

const isHeic = (f: File) => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
export const isImageFile = (f: File) => f.type.startsWith('image/') || isHeic(f);

/** Decodes any supported file to an orientation-corrected bitmap. HEIC is converted on the device. */
export async function decode(file: File): Promise<ImageBitmap> {
  let blob: Blob = file;
  if (isHeic(file)) {
    const heic2any = (await import('heic2any')).default;
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });
    blob = Array.isArray(out) ? out[0] : out;
  }
  return createImageBitmap(blob, { imageOrientation: 'from-image' });
}

/** High-quality downscale (step-halving) to fit `edge` on the long side. */
export function downscale(src: CanvasImageSource & { width: number; height: number }, edge: number): HTMLCanvasElement {
  let w = src.width, h = src.height;
  const k = Math.min(1, edge / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * k)), th = Math.max(1, Math.round(h * k));
  let cur: CanvasImageSource = src;
  while (w / 2 >= tw * 1.0001 && h / 2 >= th) {
    w = Math.round(w / 2); h = Math.round(h / 2);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d')!; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, h);
    cur = c;
  }
  const out = document.createElement('canvas'); out.width = tw; out.height = th;
  const g = out.getContext('2d')!; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, tw, th);
  return out;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Pulls camera details from EXIF. Location is never looked up online — type it if you want it. */
export async function readMeta(file: File): Promise<Meta> {
  const empty: Meta = { camera: '', lens: '', focal: '', aperture: '', shutter: '', iso: '', date: '', location: '', author: '' };
  try {
    const exifr = (await import('exifr')).default;
    const x = await exifr.parse(file, { tiff: true, exif: true, gps: false, ifd1: false, mergeOutput: true });
    if (!x) return empty;
    const make = prettyMake(String(x.Make || '').trim()), model = String(x.Model || '').trim();
    const camera = cameraName(make, model);
    const t = x.ExposureTime as number | undefined;
    const d = x.DateTimeOriginal || x.CreateDate || x.DateTime;
    const date = d instanceof Date && !isNaN(d.getTime()) ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}` : '';
    return {
      ...empty,
      camera: camera.trim(),
      lens: prettyLens(String(x.LensModel || x.Lens || '').trim()),
      focal: x.FocalLength ? `${Math.round(x.FocalLength)}mm` : '',
      aperture: x.FNumber ? `f/${r1(x.FNumber)}` : '',
      shutter: t ? (t >= 1 ? `${r1(t)}s` : `1/${Math.round(1 / t)}s`) : '',
      iso: x.ISO ? String(x.ISO) : '',
      date,
      author: String(x.Artist || '').trim(),
    };
  } catch {
    return empty;
  }
}

function prettyMake(m: string) {
  const map: Record<string, string> = { 'NIKON CORPORATION': 'Nikon', 'OLYMPUS IMAGING CORP.': 'Olympus', 'OM Digital Solutions': 'OM System', 'FUJIFILM': 'Fujifilm', 'SONY': 'Sony', 'Canon': 'Canon', 'Apple': 'Apple' };
  return map[m] ?? m.replace(/\b(CORPORATION|CORP\.?|CO\.?,? LTD\.?|INC\.?)\b/gi, '').trim().replace(/^\w+$/, w => w[0] + w.slice(1).toLowerCase());
}

/** "NIKON CORPORATION" + "NIKON D750" → "Nikon D750"; "SONY" + "ILCE-7M3" → "Sony ILCE-7M3". */
export function cameraName(make: string, model: string): string {
  if (!model) return make;
  const brand = make.split(' ')[0];
  if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) return `${make} ${model.slice(brand.length).trim()}`.trim();
  return make ? `${make} ${model}` : model;
}

/** "24.0-120.0 mm f/4.0" → "24-120mm f/4". */
export function prettyLens(l: string): string {
  return l.replace(/(\d+)\.0\b/g, '$1').replace(/\s+mm\b/gi, 'mm').replace(/\s{2,}/g, ' ').trim();
}
