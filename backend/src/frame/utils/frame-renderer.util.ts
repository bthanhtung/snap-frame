import { ExifDataDto } from '../dto/frame-response.dto.js';
import { MetadataOverrideDto } from '../dto/frame-options.dto.js';

export type FrameStyle =
  | 'white-minimal'
  | 'black-film'
  | 'light-leica'
  | 'film-strip'
  | 'polaroid'
  | 'instax'
  | 'kodachrome'
  | 'darkroom'
  | 'fujifilm';

export type FrameSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FramePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const PADDING_MAP: Record<FrameSize, number> = {
  sm: 40,
  md: 80,
  lg: 120,
  xl: 160,
};

export const STYLE_CONFIG: Record<FrameStyle, {
  bg: string; text: string; secondaryText: string; accentText: string;
  font: string; fontWeight: string; accent?: string;
}> = {
  'white-minimal': {
    bg: '#FFFFFF', text: '#1A1A1A', secondaryText: '#666666', accentText: '#999999',
    font: 'Arial, Helvetica, sans-serif', fontWeight: '300',
  },
  'black-film': {
    bg: '#0D0D0D', text: '#EEEEEE', secondaryText: '#AAAAAA', accentText: '#777777',
    font: 'Arial, Helvetica, sans-serif', fontWeight: '300',
  },
  'light-leica': {
    bg: '#F8F4EF', text: '#1A1A1A', secondaryText: '#555555', accentText: '#888888',
    font: 'Georgia, Times New Roman, serif', fontWeight: '400',
  },
  'film-strip': {
    bg: '#111111', text: '#E8E0D0', secondaryText: '#B0A090', accentText: '#806050',
    font: 'Courier New, Courier, monospace', fontWeight: '400',
  },
  'polaroid': {
    bg: '#FEFEFE', text: '#2D2D2D', secondaryText: '#666666', accentText: '#AAAAAA',
    font: 'Georgia, Times New Roman, serif', fontWeight: '400',
  },
  'instax': {
    bg: '#FFFEF5', text: '#3D3D3D', secondaryText: '#888888', accentText: '#BBBBBB',
    font: 'Arial Rounded MT Bold, Arial, sans-serif', fontWeight: '400', accent: '#F5A623',
  },
  'kodachrome': {
    bg: '#F5E6C8', text: '#3A2A0A', secondaryText: '#7A5A2A', accentText: '#C8943A',
    font: 'Georgia, Times New Roman, serif', fontWeight: '400', accent: '#C8943A',
  },
  'darkroom': {
    bg: '#0A0A0A', text: '#CCCCCC', secondaryText: '#888888', accentText: '#3D0A0A',
    font: 'Arial, Helvetica, sans-serif', fontWeight: '300', accent: '#8B0000',
  },
  'fujifilm': {
    bg: '#FFFFFF', text: '#1A1A1A', secondaryText: '#555555', accentText: '#1E8A40',
    font: 'Arial, Helvetica, sans-serif', fontWeight: '300', accent: '#1E8A40',
  },
};

export function buildDisplayMetadata(
  exif: ExifDataDto,
  override?: MetadataOverrideDto,
): Record<string, string> {
  const defaultShowFields = ['camera', 'lens', 'focalLength', 'aperture', 'shutterSpeed', 'iso', 'date'];
  const showFields = override?.showFields ?? defaultShowFields;
  const merged: Record<string, string | undefined> = {
    camera: override?.camera ?? exif.camera,
    lens: override?.lens ?? exif.lens,
    focalLength: override?.focalLength ?? exif.focalLength,
    aperture: override?.aperture ?? exif.aperture,
    shutterSpeed: override?.shutterSpeed ?? exif.shutterSpeed,
    iso: (override?.iso ?? exif.iso) ? `ISO ${override?.iso ?? exif.iso}` : undefined,
    date: override?.date ?? exif.date,
    location: override?.location,
  };
  const result: Record<string, string> = {};
  for (const field of showFields) {
    if (merged[field]) result[field] = merged[field]!;
  }
  return result;
}

export function calculatePadding(
  imageWidth: number,
  imageHeight: number,
  style: FrameStyle,
  size: FrameSize,
): FramePadding {
  const b = PADDING_MAP[size];
  switch (style) {
    case 'polaroid':
      // Polaroid: thin sides + top, very thick bottom
      return { top: Math.round(b * 0.4), right: Math.round(b * 0.5), bottom: Math.round(b * 3.5), left: Math.round(b * 0.5) };
    case 'instax':
      // Instax: equal thin border all sides, slightly more bottom
      return { top: Math.round(b * 0.5), right: Math.round(b * 0.5), bottom: Math.round(b * 1.2), left: Math.round(b * 0.5) };
    case 'kodachrome':
      return { top: Math.round(b * 0.5), right: Math.round(b * 0.5), bottom: Math.round(b * 2.8), left: Math.round(b * 0.5) };
    case 'darkroom':
      return { top: Math.round(b * 0.3), right: Math.round(b * 0.3), bottom: Math.round(b * 2.5), left: Math.round(b * 0.3) };
    case 'fujifilm':
      return { top: Math.round(b * 0.4), right: Math.round(b * 0.4), bottom: Math.round(b * 2.2), left: Math.round(b * 0.4) };
    case 'film-strip':
      return { top: Math.round(b * 0.6), right: Math.round(b * 0.6), bottom: Math.round(b * 2.8), left: Math.round(b * 0.6) };
    case 'white-minimal':
    case 'light-leica':
      return { top: Math.round(b * 0.5), right: Math.round(b * 0.5), bottom: Math.round(b * 2.5), left: Math.round(b * 0.5) };
    default:
      return { top: Math.round(b * 0.6), right: Math.round(b * 0.6), bottom: Math.round(b * 3.0), left: Math.round(b * 0.6) };
  }
}

export function getBackgroundRgb(style: FrameStyle): { r: number; g: number; b: number } {
  const map: Record<FrameStyle, [number, number, number]> = {
    'white-minimal': [255, 255, 255],
    'black-film':    [13,  13,  13],
    'light-leica':   [248, 244, 239],
    'film-strip':    [17,  17,  17],
    'polaroid':      [254, 254, 254],
    'instax':        [255, 254, 245],
    'kodachrome':    [245, 230, 200],
    'darkroom':      [10,  10,  10],
    'fujifilm':      [255, 255, 255],
  };
  const [r, g, b] = map[style];
  return { r, g, b };
}

export function generateFrameSvg(
  canvasWidth: number,
  canvasHeight: number,
  imageHeight: number,
  padding: FramePadding,
  style: FrameStyle,
  metadata: Record<string, string>,
  cameraBrand?: string,
): Buffer {
  const config = STYLE_CONFIG[style];
  const metadataAreaTop = padding.top + imageHeight;
  const metadataAreaHeight = canvasHeight - metadataAreaTop;
  const fs  = Math.max(16, Math.min(28, Math.round(canvasWidth / 55)));
  const sfs = Math.round(fs * 0.78);
  const lh  = Math.round(fs * 1.7);
  const sy  = metadataAreaTop + Math.round(metadataAreaHeight * 0.28) + fs;

  const innerSvg = renderStyle(style, canvasWidth, canvasHeight, padding, config, metadata, fs, sfs, lh, sy, imageHeight, cameraBrand);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n${innerSvg}\n</svg>`);
}

function renderStyle(
  style: FrameStyle, w: number, h: number, padding: FramePadding,
  config: (typeof STYLE_CONFIG)[FrameStyle], meta: Record<string, string>,
  fs: number, sfs: number, lh: number, sy: number, imageHeight: number, cameraBrand?: string,
): string {
  switch (style) {
    case 'white-minimal': return minimalContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight);
    case 'black-film':    return filmContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand);
    case 'light-leica':   return leicaContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand);
    case 'film-strip':    return filmStripContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight);
    case 'polaroid':      return polaroidContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight);
    case 'instax':        return instaxContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight);
    case 'kodachrome':    return kodachromeContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand);
    case 'darkroom':      return darkroomContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand);
    case 'fujifilm':      return fujifilmContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight, cameraBrand);
    default: return '';
  }
}

function xe(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// —————————————————————————————————————————
// Style: White Minimal
// —————————————————————————————————————————
function minimalContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, imageHeight: number,
): string {
  const lx = padding.left + 24;
  const rx = w - padding.right - 24;
  const imageBottom = padding.top + imageHeight;
  const camera = xe(meta.camera ?? '');
  const lens   = xe(meta.lens ?? '');
  const specs  = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ·  ');
  const date   = xe(meta.date ?? '');
  return `
  <line x1="${padding.left + 16}" y1="${imageBottom + Math.round(padding.bottom * 0.08)}"
    x2="${w - padding.right - 16}" y2="${imageBottom + Math.round(padding.bottom * 0.08)}"
    stroke="${config.accentText}" stroke-width="0.6" opacity="0.35"/>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="500" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens   ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs  ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Black Film
// —————————————————————————————————————————
function filmContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, cameraBrand?: string,
): string {
  const lx = padding.left + 28;
  const rx = w - padding.right - 28;
  const cx = Math.round(w / 2);
  const camera    = xe(meta.camera ?? cameraBrand ?? '');
  const lens      = xe(meta.lens ?? '');
  const leftSpec  = [meta.focalLength, meta.aperture].filter(Boolean).map(xe).join('  ◆  ');
  const rightSpec = [meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ◆  ');
  const date      = xe(meta.date ?? '');
  return `
  ${camera ? `<text x="${cx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="300" letter-spacing="4" fill="${config.text}" text-anchor="middle">${camera.toUpperCase()}</text>` : ''}
  <line x1="${lx}" y1="${sy + Math.round(lh * 0.4)}" x2="${rx}" y2="${sy + Math.round(lh * 0.4)}" stroke="${config.accentText}" stroke-width="0.5"/>
  ${lens      ? `<text x="${cx}" y="${sy + lh * 1.15}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="middle">${lens}</text>` : ''}
  ${leftSpec  ? `<text x="${lx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="start">${leftSpec}</text>` : ''}
  ${date      ? `<text x="${cx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="2" fill="${config.accentText}" text-anchor="middle">${date}</text>` : ''}
  ${rightSpec ? `<text x="${rx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${rightSpec}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Light Leica
// —————————————————————————————————————————
function leicaContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, cameraBrand?: string,
): string {
  const lx = padding.left + 28;
  const rx = w - padding.right - 28;
  const isLeica = cameraBrand?.toLowerCase().includes('leica');
  const camera = xe(meta.camera ?? '');
  const lens   = xe(meta.lens ?? '');
  const specs  = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('   ');
  const date   = xe(meta.date ?? '');
  return `
  ${isLeica ? `<circle cx="${rx}" cy="${sy - Math.round(fs * 0.35)}" r="${Math.round(fs * 0.42)}" fill="#CC0000"/>` : ''}
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" letter-spacing="1" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens   ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" font-style="italic" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  <line x1="${lx}" y1="${sy + lh * 1.6}" x2="${Math.round(w * 0.38)}" y2="${sy + lh * 1.6}" stroke="${config.secondaryText}" stroke-width="0.7" opacity="0.4"/>
  ${specs ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date  ? `<text x="${rx}" y="${sy + lh * 2.15}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" font-style="italic" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Film Strip
// —————————————————————————————————————————
function filmStripContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, imageHeight: number,
): string {
  const lx = padding.left + 28;
  const rx = w - padding.right - 28;
  const ss = Math.round(Math.min(w, h) * 0.016);
  const sp = ss * 3.8;
  const gy = Math.round(padding.top * 0.22);
  let sprockets = '';
  for (let px = padding.left + sp; px < w - padding.right - ss; px += sp) {
    const ix = Math.round(px - ss / 2);
    const sh = Math.round(ss * 1.4);
    sprockets += `<rect x="${ix}" y="${Math.round(gy - sh / 2)}" width="${ss}" height="${sh}" rx="2" fill="${config.accentText}" opacity="0.7"/>`;
    const btY = Math.round((padding.top + imageHeight + Math.round(padding.bottom * 0.1)) - sh / 2);
    sprockets += `<rect x="${ix}" y="${btY}" width="${ss}" height="${sh}" rx="2" fill="${config.accentText}" opacity="0.7"/>`;
  }
  const camera   = xe(meta.camera ?? '');
  const lens     = xe(meta.lens ?? '');
  const specs    = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ');
  const date     = xe(meta.date ?? '');
  const frameNum = String(Math.floor(Math.random() * 36) + 1).padStart(2, '0');
  return `
  ${sprockets}
  <text x="${lx}" y="${sy - Math.round(lh * 0.4)}" font-family="${config.font}" font-size="${Math.round(fs * 0.65)}px" font-weight="400" fill="${config.accentText}" text-anchor="start">${frameNum}</text>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="400" letter-spacing="2" fill="${config.text}" text-anchor="start">${camera.toUpperCase()}</text>` : ''}
  ${lens   ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs  ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Polaroid — thick white bottom, handwriting-ish serif
// —————————————————————————————————————————
function polaroidContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, imageHeight: number,
): string {
  const cx = Math.round(w / 2);
  const imageBottom = padding.top + imageHeight;
  // Subtle shadow line under image
  const camera = xe(meta.camera ?? '');
  const date   = xe(meta.date ?? '');
  const loc    = xe(meta.location ?? '');
  // Main label: location or camera, centered, italic serif
  const mainLabel = loc || camera;
  const subLabel  = date;
  return `
  <line x1="${padding.left}" y1="${imageBottom}" x2="${w - padding.right}" y2="${imageBottom}" stroke="#E0E0E0" stroke-width="1"/>
  ${mainLabel ? `<text x="${cx}" y="${sy}" font-family="${config.font}" font-size="${Math.round(fs * 1.05)}px" font-weight="400" font-style="italic" fill="${config.text}" text-anchor="middle">${mainLabel}</text>` : ''}
  ${subLabel  ? `<text x="${cx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="middle">${subLabel}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Instax Mini — pastel white, orange accent, centered minimal
// —————————————————————————————————————————
function instaxContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, imageHeight: number,
): string {
  const cx = Math.round(w / 2);
  const lx = padding.left + 20;
  const rx = w - padding.right - 20;
  const imageBottom = padding.top + imageHeight;
  const accent = config.accent ?? '#F5A623';
  // Orange accent bar at very bottom
  const barH = Math.max(6, Math.round(padding.bottom * 0.06));
  const camera = xe(meta.camera ?? '');
  const date   = xe(meta.date ?? '');
  return `
  <rect x="${padding.left}" y="${h - barH}" width="${w - padding.left - padding.right}" height="${barH}" fill="${accent}" rx="2"/>
  <rect x="${padding.left}" y="${imageBottom}" width="${w - padding.left - padding.right}" height="2" fill="${accent}" opacity="0.3"/>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.secondaryText}" text-anchor="start">${camera}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${accent}" text-anchor="end">${date}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Kodachrome — warm cream, vintage orange-brown text
// —————————————————————————————————————————
function kodachromeContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, cameraBrand?: string,
): string {
  const lx = padding.left + 28;
  const rx = w - padding.right - 28;
  const cx = Math.round(w / 2);
  const accent = config.accent ?? '#C8943A';
  // Kodachrome logo-style box top-left
  const camera = xe(meta.camera ?? cameraBrand ?? '');
  const lens   = xe(meta.lens ?? '');
  const specs  = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ');
  const date   = xe(meta.date ?? '');
  const badgeH = Math.round(fs * 1.4);
  return `
  <!-- Vintage badge left -->
  <rect x="${lx - 8}" y="${sy - badgeH + Math.round(badgeH * 0.25)}" width="${Math.round(fs * 5.5)}" height="${badgeH}" rx="3" fill="${accent}" opacity="0.12"/>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="700" letter-spacing="1" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens   ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs  ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${accent}" text-anchor="end">${specs}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" font-style="italic" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}
  <!-- Bottom vintage line -->
  <line x1="${lx - 8}" y1="${sy + lh * 1.7}" x2="${rx + 8}" y2="${sy + lh * 1.7}" stroke="${accent}" stroke-width="0.8" opacity="0.5"/>`;
}

// —————————————————————————————————————————
// Style: Darkroom — near-black, subtle red accents
// —————————————————————————————————————————
function darkroomContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, cameraBrand?: string,
): string {
  const lx = padding.left + 24;
  const rx = w - padding.right - 24;
  const cx = Math.round(w / 2);
  const accent = config.accent ?? '#8B0000';
  const camera = xe(meta.camera ?? cameraBrand ?? '');
  const lens   = xe(meta.lens ?? '');
  const specs  = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ·  ');
  const date   = xe(meta.date ?? '');
  return `
  <!-- Red accent left edge -->
  <rect x="${Math.round(padding.left * 0.25)}" y="${sy - Math.round(fs * 0.8)}" width="2" height="${lh * 2.5}" fill="${accent}" opacity="0.7"/>
  ${camera ? `<text x="${lx + 8}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="300" letter-spacing="3" fill="${config.text}" text-anchor="start">${camera.toUpperCase()}</text>` : ''}
  ${lens   ? `<text x="${lx + 8}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs  ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${accent}" text-anchor="end">${date}</text>` : ''}`;
}

// —————————————————————————————————————————
// Style: Fujifilm — white with Fuji green accent line
// —————————————————————————————————————————
function fujifilmContent(
  w: number, h: number, padding: FramePadding, config: (typeof STYLE_CONFIG)[FrameStyle],
  meta: Record<string, string>, fs: number, sfs: number, lh: number, sy: number, imageHeight: number, cameraBrand?: string,
): string {
  const lx = padding.left + 24;
  const rx = w - padding.right - 24;
  const imageBottom = padding.top + imageHeight;
  const accent = config.accent ?? '#1E8A40';
  const camera = xe(meta.camera ?? cameraBrand ?? '');
  const lens   = xe(meta.lens ?? '');
  const specs  = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(xe).join('  ·  ');
  const date   = xe(meta.date ?? '');
  const barH = Math.max(3, Math.round(padding.bottom * 0.04));
  return `
  <!-- Fuji green accent bar -->
  <rect x="${padding.left}" y="${imageBottom + Math.round(padding.bottom * 0.12)}" width="${Math.round((w - padding.left - padding.right) * 0.35)}" height="${barH}" fill="${accent}"/>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="500" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens   ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs  ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date   ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${accent}" text-anchor="end">${date}</text>` : ''}`;
}
