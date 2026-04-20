import { ExifDataDto } from '../dto/frame-response.dto.js';

export type FrameStyle =
  | 'white-minimal' | 'black-film' | 'light-leica' | 'film-strip'
  | 'polaroid' | 'instax' | 'kodachrome' | 'darkroom' | 'fujifilm';

export type FrameSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FramePadding { top: number; right: number; bottom: number; left: number; }

export const STYLE_CONFIG: Record<FrameStyle, {
  bg: string; text: string; secondaryText: string; accentText: string;
  font: string; fontWeight: string; accent?: string;
}> = {
  'white-minimal': { bg: '#FFFFFF', text: '#1A1A1A', secondaryText: '#666666', accentText: '#999999', font: 'Arial, Helvetica, sans-serif', fontWeight: '300' },
  'black-film':    { bg: '#0D0D0D', text: '#EEEEEE', secondaryText: '#AAAAAA', accentText: '#777777', font: 'Arial, Helvetica, sans-serif', fontWeight: '300' },
  'light-leica':   { bg: '#F8F4EF', text: '#1A1A1A', secondaryText: '#555555', accentText: '#888888', font: 'serif', fontWeight: '400' },
  'film-strip':    { bg: '#111111', text: '#E8E0D0', secondaryText: '#B0A090', accentText: '#806050', font: 'monospace', fontWeight: '400' },
  'polaroid':      { bg: '#FEFEFE', text: '#2D2D2D', secondaryText: '#666666', accentText: '#AAAAAA', font: 'serif', fontWeight: '400' },
  'instax':        { bg: '#FFFEF5', text: '#3D3D3D', secondaryText: '#888888', accentText: '#BBBBBB', font: 'sans-serif', fontWeight: '400', accent: '#F5A623' },
  'kodachrome':    { bg: '#F5E6C8', text: '#3A2A0A', secondaryText: '#7A5A2A', accentText: '#C8943A', font: 'serif', fontWeight: '400', accent: '#C8943A' },
  'darkroom':      { bg: '#0A0A0A', text: '#CCCCCC', secondaryText: '#888888', accentText: '#3D0A0A', font: 'sans-serif', fontWeight: '300', accent: '#8B0000' },
  'fujifilm':      { bg: '#FFFFFF', text: '#1A1A1A', secondaryText: '#555555', accentText: '#1E8A40', font: 'sans-serif', fontWeight: '300', accent: '#1E8A40' },
};

export function buildDisplayMetadata(exif: ExifDataDto, override?: any): Record<string, any> {
  const showFields = override?.showFields ?? ['camera', 'lens', 'focalLength', 'aperture', 'shutterSpeed', 'iso', 'date', 'author'];
  const merged: Record<string, any> = {
    camera: override?.camera !== undefined ? override.camera : exif.camera,
    lens: override?.lens !== undefined ? override.lens : exif.lens,
    focalLength: override?.focalLength !== undefined ? override.focalLength : exif.focalLength,
    aperture: override?.aperture !== undefined ? override.aperture : exif.aperture,
    shutterSpeed: override?.shutterSpeed !== undefined ? override.shutterSpeed : exif.shutterSpeed,
    iso: (override?.iso !== undefined ? override.iso : exif.iso) ? `${override?.iso !== undefined ? override.iso : exif.iso}` : undefined,
    date: override?.date !== undefined ? override.date : exif.date,
    location: override?.location,
    author: override?.author,
    position: override?.position ?? 'between',
    vPosition: override?.vPosition ?? 'bottom',
  };
  const result: Record<string, any> = { _pos: merged.position, _vpos: merged.vPosition };
  for (const field of showFields) {
    if (merged[field] !== undefined) result[field] = String(merged[field]);
  }
  return result;
}

export function calculatePadding(w: number, h: number, style: FrameStyle, size: FrameSize, vPos: 'top' | 'bottom' = 'bottom'): FramePadding {
  const b = { sm: 40, md: 80, lg: 120, xl: 160 }[size];
  const pads: Record<FrameStyle, any> = {
    'polaroid': { t: 0.4, r: 0.5, b: 3.5, l: 0.5 }, 'instax': { t: 0.5, r: 0.5, b: 1.2, l: 0.5 },
    'kodachrome': { t: 0.5, r: 0.5, b: 2.8, l: 0.5 }, 'darkroom': { t: 0.3, r: 0.3, b: 2.5, l: 0.3 },
    'fujifilm': { t: 0.4, r: 0.4, b: 2.2, l: 0.4 }, 'film-strip': { t: 0.6, r: 0.6, b: 2.8, l: 0.6 },
    'white-minimal': { t: 0.5, r: 0.5, b: 2.5, l: 0.5 }, 'black-film': { t: 0.5, r: 0.5, b: 2.5, l: 0.5 },
    'light-leica': { t: 0.5, r: 0.5, b: 2.5, l: 0.5 }
  };
  const p = pads[style] || { t: 0.6, r: 0.6, b: 3.0, l: 0.6 };
  
  // DYNAMIC PADDING: Swap top/bottom if metadata is at the top
  const finalTop = vPos === 'top' ? p.b : p.t;
  const finalBottom = vPos === 'top' ? p.t : p.b;

  return { 
    top: Math.round(b * finalTop), 
    right: Math.round(b * p.r), 
    bottom: Math.round(b * finalBottom), 
    left: Math.round(b * p.l) 
  };
}

export function generateFrameSvg(
  w: number, h: number, imgH: number, padding: FramePadding,
  style: FrameStyle, meta: Record<string, string>, options: any = {}
): Buffer {
  const config = STYLE_CONFIG[style];
  const fs = Math.max(16, Math.min(28, Math.round(w / 55)));
  const sfs = Math.round(fs * 0.8);
  const lh = Math.round(fs * 1.6);
  
  const isTop = meta._vpos === 'top';
  // Adjust Y base: if top, it's relative to padding.top. If bottom, it's relative to image bottom.
  const yBase = isTop ? Math.round(padding.top * 0.28) : (padding.top + imgH + Math.round(padding.bottom * 0.25));
  const sy = yBase + fs;

  const lx = padding.left + 24;
  const rx = w - padding.right - 24;
  const cx = Math.round(w / 2);

  const camera = xe(meta.camera ?? '');
  const author = xe(meta.author ?? '');
  const lens = xe(meta.lens ?? '');
  const specs = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso ? `ISO ${meta.iso}` : ''].filter(Boolean).map(xe).join('  ·  ');
  const date = xe(meta.date ?? '');

  // Format "Shot on" label
  const authorLabel = author ? author : '';

  let content = '';
  const pos = meta._pos || 'between';

  if (pos === 'center') {
    content = `
      <text x="${cx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" fill="${config.text}" text-anchor="middle">${camera} ${authorLabel ? ` | ${authorLabel}` : ''}</text>
      <text x="${cx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="middle">${lens}  ${specs}</text>
    `;
  } else if (pos === 'left') {
    content = `
      <text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" fill="${config.text}" text-anchor="start">${camera} ${authorLabel ? ` | ${authorLabel}` : ''}</text>
      <text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}  ${specs}  ${date}</text>
    `;
  } else if (pos === 'right') {
    content = `
      <text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" fill="${config.text}" text-anchor="end">${camera} ${authorLabel ? ` | ${authorLabel}` : ''}</text>
      <text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${lens}  ${specs}  ${date}</text>
    `;
  } else {
    // Default: Between
    content = `
      <text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" fill="${config.text}" text-anchor="start">${camera} ${authorLabel ? ` | ${authorLabel}` : ''}</text>
      <text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}</text>
      <text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${specs}</text>
      <text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.accentText}" text-anchor="end">${date}</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    ${content}
  </svg>`;
  return Buffer.from(svg);
}

function xe(str: string): string {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getBackgroundRgb(style: FrameStyle): { r: number; g: number; b: number } {
  const map: Record<FrameStyle, [number, number, number]> = {
    'white-minimal': [255, 255, 255], 'black-film': [13, 13, 13], 'light-leica': [248, 244, 239],
    'film-strip': [17, 17, 17], 'polaroid': [254, 254, 254], 'instax': [255, 254, 245],
    'kodachrome': [245, 230, 200], 'darkroom': [10, 10, 10], 'fujifilm': [255, 255, 255],
  };
  const [r, g, b] = map[style];
  return { r, g, b };
}
