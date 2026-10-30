/**
 * Frame composition (Canvas 2D). Everything is sized relative to the photo, so the low-resolution
 * preview and the full-resolution export are pixel-for-pixel the same design.
 */
export type FrameStyle = 'none' | 'white' | 'black' | 'leica' | 'gallery' | 'polaroid' | 'instax' | 'filmstrip'
  | 'slide' | 'darkroom' | 'fuji' | 'blur' | 'datestamp';
export type Aspect = 'original' | '1:1' | '4:5' | '9:16' | '3:2' | '16:9';
export type TextLayout = 'split' | 'center' | 'left' | 'none';
export type FontKind = 'sans' | 'serif' | 'mono' | 'script';
export type MarkPos = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br';
export const FIELDS = ['camera', 'lens', 'focal', 'aperture', 'shutter', 'iso', 'date', 'location', 'author'] as const;
export type Field = (typeof FIELDS)[number];
export type Meta = Record<Field, string>;

export interface FrameSettings {
  style: FrameStyle;
  aspect: Aspect;
  padding: number;          // 0.5..2, scales the frame margins
  bg: string | null;        // null = style default
  radius: number;           // 0..1 (relative corner rounding of the photo)
  shadow: number;           // 0..1
  border: number;           // 0..1 thin line around the photo
  layout: TextLayout;
  font: FontKind;
  fields: Field[];
  textPos: 'bottom' | 'top';
}
export interface MarkSettings {
  kind: 'none' | 'text' | 'logo';
  text: string;
  font: FontKind;
  logo: string | null;      // data URL of an uploaded logo
  pos: MarkPos;
  opacity: number;          // 0..1
  size: number;             // 0.05..0.5 of the photo width
  color: string;
}
export type Fonts = Record<FontKind, string>;

export const DEFAULT_FRAME: FrameSettings = {
  style: 'white', aspect: 'original', padding: 1, bg: null, radius: 0, shadow: 0, border: 0,
  layout: 'split', font: 'sans', fields: ['camera', 'lens', 'focal', 'aperture', 'shutter', 'iso'], textPos: 'bottom',
};
export const DEFAULT_MARK: MarkSettings = { kind: 'none', text: '', font: 'script', logo: null, pos: 'br', opacity: 0.85, size: 0.18, color: '#ffffff' };

interface StyleDef { label: string; bg: string; text: string; sub: string; pad: [number, number, number, number]; font?: FontKind; textured?: boolean }
export const STYLES: Record<FrameStyle, StyleDef> = {
  none:      { label: 'No frame',   bg: '#ffffff', text: '#ffffff', sub: '#ffffffcc', pad: [0, 0, 0, 0] },
  white:     { label: 'Classic',    bg: '#ffffff', text: '#18181b', sub: '#71717a', pad: [1, 1, 3.4, 1] },
  black:     { label: 'Noir',       bg: '#0b0b0c', text: '#f4f4f5', sub: '#a1a1aa', pad: [1, 1, 3.4, 1] },
  leica:     { label: 'Rangefinder', bg: '#f6f1e9', text: '#1c1917', sub: '#78716c', pad: [1, 1, 3.4, 1], font: 'serif', textured: true },
  gallery:   { label: 'Gallery',    bg: '#f4f2ee', text: '#27272a', sub: '#8a8580', pad: [3.2, 3.2, 4.6, 3.2], font: 'serif', textured: true },
  polaroid:  { label: 'Polaroid',   bg: '#fbfaf6', text: '#27272a', sub: '#71717a', pad: [1.3, 1.3, 7.6, 1.3], font: 'script', textured: true },
  instax:    { label: 'Instax',     bg: '#fffdf5', text: '#3f3f46', sub: '#a1a1aa', pad: [1.6, 1.6, 4.4, 1.6], textured: true },
  filmstrip: { label: 'Film strip', bg: '#0e0d0c', text: '#f0b464', sub: '#b07c3c', pad: [3, 1.2, 3, 1.2], font: 'mono' },
  slide:     { label: 'Slide mount', bg: '#efe4c9', text: '#3b2f1a', sub: '#8a7350', pad: [2.6, 2.6, 2.6, 2.6], font: 'serif', textured: true },
  darkroom:  { label: 'Darkroom',   bg: '#050505', text: '#e4e4e7', sub: '#71717a', pad: [0.9, 0.9, 3.2, 0.9], font: 'mono' },
  fuji:      { label: 'Chroma',     bg: '#ffffff', text: '#14532d', sub: '#16a34a', pad: [1, 1, 3.4, 1] },
  blur:      { label: 'Blur backdrop', bg: '#000000', text: '#ffffff', sub: '#ffffffb3', pad: [2.4, 2.4, 4, 2.4] },
  datestamp: { label: 'Date stamp', bg: '#000000', text: '#ffffff', sub: '#ffffffcc', pad: [0, 0, 0, 0], font: 'mono' },
};

const ASPECTS: Record<Exclude<Aspect, 'original'>, number> = { '1:1': 1, '4:5': 4 / 5, '9:16': 9 / 16, '3:2': 3 / 2, '16:9': 16 / 9 };

type Img = CanvasImageSource & { width: number; height: number };

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (r <= 0) { ctx.rect(x, y, w, h); return; }
  ctx.roundRect(x, y, w, h, r);
}

let paperCache: HTMLCanvasElement | null = null;
function paper(): HTMLCanvasElement {
  if (paperCache) return paperCache;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!, d = g.createImageData(256, 256);
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 40; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 18; }
  g.putImageData(d, 0, 0);
  return (paperCache = c);
}

/** The text block content for the chosen fields. */
export function metaLines(meta: Meta, fields: Field[]) {
  const has = (f: Field) => fields.includes(f) && !!meta[f]?.trim();
  const title = has('camera') ? meta.camera : '';
  const lens = has('lens') ? meta.lens : '';
  const specs = (['focal', 'aperture', 'shutter', 'iso'] as Field[]).filter(has).map(f => (f === 'iso' ? `ISO ${meta.iso.replace(/^ISO\s*/i, '')}` : meta[f]));
  const extra = (['date', 'location', 'author'] as Field[]).filter(has).map(f => meta[f]);
  return { title, lens, specs: specs.join('   '), extra: extra.join('  ·  ') };
}

export interface ComposeInput {
  photo: Img;
  frame: FrameSettings;
  meta: Meta;
  mark: MarkSettings;
  logo?: Img | null;
  fonts: Fonts;
  lookName?: string;
}

/** Final canvas size for a photo of pw×ph with these settings (used to size exports before rendering). */
export function layout(pw: number, ph: number, f: FrameSettings) {
  const st = STYLES[f.style];
  const unit = Math.max(pw, ph) * 0.026 * f.padding;
  let [t, r, b, l] = st.pad.map(p => p * unit);
  const wantsText = f.layout !== 'none' && f.fields.length > 0;
  if (!wantsText && b > t) b = t;                         // no caption: keep the frame even
  if (f.textPos === 'top' && b > t) [t, b] = [b, t];
  let W = pw + l + r, H = ph + t + b;
  if (f.aspect !== 'original') {
    const target = ASPECTS[f.aspect];
    if (W / H > target) { const nh = W / target; const extra = nh - H; t += extra / 2; b += extra / 2; H = nh; }
    else { const nw = H * target; const extra = nw - W; l += extra / 2; r += extra / 2; W = nw; }
  }
  return { W: Math.round(W), H: Math.round(H), x: Math.round(l), y: Math.round(t), unit, top: t, bottom: b };
}

export function compose({ photo, frame: f, meta, mark, logo, fonts, lookName }: ComposeInput, out?: HTMLCanvasElement): HTMLCanvasElement {
  const st = STYLES[f.style];
  const pw = photo.width, ph = photo.height;
  const L = layout(pw, ph, f);
  const c = out ?? document.createElement('canvas');
  if (c.width !== L.W || c.height !== L.H) { c.width = L.W; c.height = L.H; }
  const ctx = c.getContext('2d')!;
  ctx.save();
  ctx.clearRect(0, 0, L.W, L.H);
  const bg = f.bg ?? st.bg;
  const dark = isDark(bg);
  const textColor = f.bg ? (dark ? '#f4f4f5' : '#18181b') : st.text;
  const subColor = f.bg ? (dark ? '#a1a1aa' : '#71717a') : st.sub;

  // background
  if (f.style === 'blur') {
    // cheap, cross-browser blur: shrink hard, then scale up with smoothing
    const tiny = document.createElement('canvas'); tiny.width = 24; tiny.height = Math.max(1, Math.round(24 * L.H / L.W));
    const tc = tiny.getContext('2d')!; tc.imageSmoothingQuality = 'high';
    const s = Math.max(tiny.width / pw, tiny.height / ph);
    tc.drawImage(photo, (tiny.width - pw * s) / 2, (tiny.height - ph * s) / 2, pw * s, ph * s);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tiny, 0, 0, L.W, L.H);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, 0, L.W, L.H);
  } else {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, L.W, L.H);
    if (st.textured && !f.bg) { ctx.globalAlpha = 1; ctx.fillStyle = ctx.createPattern(paper(), 'repeat')!; ctx.fillRect(0, 0, L.W, L.H); }
  }

  if (f.style === 'filmstrip') drawSprockets(ctx, L, pw, ph, st, fonts, lookName);

  // photo with optional radius / shadow / border
  const radius = f.radius * Math.min(pw, ph) * 0.12 + (f.style === 'slide' ? Math.min(pw, ph) * 0.03 : 0);
  const shadow = f.shadow + (f.style === 'blur' ? 0.6 : 0) + (f.style === 'gallery' ? 0.15 : 0);
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.18 + shadow * 0.35})`;
    ctx.shadowBlur = L.unit * (0.6 + shadow * 2.4);
    ctx.shadowOffsetY = L.unit * shadow * 0.5;
    ctx.fillStyle = '#000';
    roundRect(ctx, L.x, L.y, pw, ph, radius); ctx.fill();
    ctx.restore();
  }
  ctx.save();
  roundRect(ctx, L.x, L.y, pw, ph, radius); ctx.clip();
  ctx.drawImage(photo, L.x, L.y, pw, ph);
  ctx.restore();
  if (f.border > 0 || f.style === 'darkroom' || f.style === 'gallery') {
    const bw = Math.max(1, L.unit * (0.06 + f.border * 0.3));
    ctx.strokeStyle = f.style === 'darkroom' ? '#f4f4f5' : withAlpha(textColor, f.style === 'gallery' ? 0.18 : 0.7);
    ctx.lineWidth = f.style === 'darkroom' ? bw * 2 : bw;
    roundRect(ctx, L.x - ctx.lineWidth / 2, L.y - ctx.lineWidth / 2, pw + ctx.lineWidth, ph + ctx.lineWidth, radius); ctx.stroke();
  }

  // caption
  const lines = metaLines(meta, f.fields);
  if (f.style === 'datestamp') drawDateStamp(ctx, L, pw, ph, meta, fonts);
  else if (f.style === 'filmstrip') {
    if (f.layout !== 'none') {
      ctx.fillStyle = st.sub; ctx.font = `500 ${Math.round(L.unit * 0.5)}px ${fonts.mono}`; ctx.textBaseline = 'middle';
      const y = L.y + ph + L.unit * 0.42;
      ctx.textAlign = 'left'; ctx.fillText([lines.title, lines.lens].filter(Boolean).join('  ·  ').toUpperCase(), L.x, y, pw * 0.5);
      ctx.textAlign = 'right'; ctx.fillText([lines.specs, lines.extra].filter(Boolean).join('   ').toUpperCase(), L.x + pw, y, pw * 0.48);
    }
  }
  else if (f.layout !== 'none' && (lines.title || lines.lens || lines.specs || lines.extra)) {
    const fam = fonts[f.font === 'sans' && st.font ? st.font : f.font];
    const capH = f.textPos === 'top' ? L.top : L.bottom;
    const overlay = capH < L.unit * 1.6;     // no room in the frame: write on the photo
    drawCaption(ctx, { L, pw, ph, lines, fam, mono: fonts.mono, layout: f.layout, textColor: overlay ? '#ffffff' : textColor, subColor: overlay ? '#ffffffcc' : subColor, overlay, top: f.textPos === 'top', style: f.style });
  }

  // signature / logo
  if (mark.kind !== 'none') drawMark(ctx, L, pw, ph, mark, logo ?? null, fonts);
  ctx.restore();
  return c;
}

function drawCaption(ctx: CanvasRenderingContext2D, o: {
  L: ReturnType<typeof layout>; pw: number; ph: number; lines: ReturnType<typeof metaLines>; fam: string; mono: string;
  layout: TextLayout; textColor: string; subColor: string; overlay: boolean; top: boolean; style: FrameStyle;
}) {
  const { L, pw, ph, lines } = o;
  const fs = L.unit * (o.style === 'polaroid' ? 0.95 : 0.62);
  const left = L.x, right = L.x + pw;
  let cy: number;  // vertical centre of the caption band
  if (o.overlay) {
    const gh = ph * 0.22;
    const y0 = o.top ? L.y : L.y + ph - gh;
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + gh);
    grad.addColorStop(o.top ? 0 : 1, 'rgba(0,0,0,.55)'); grad.addColorStop(o.top ? 1 : 0, 'rgba(0,0,0,0)');
    ctx.save(); roundRect(ctx, L.x, L.y, pw, ph, 0); ctx.clip(); ctx.fillStyle = grad; ctx.fillRect(L.x, y0, pw, gh); ctx.restore();
    cy = o.top ? L.y + fs * 1.6 : L.y + ph - fs * 1.6;
  } else {
    cy = o.top ? L.y - (L.top) / 2 : L.y + ph + L.bottom / 2;
    if (o.style === 'polaroid') cy = L.y + ph + L.bottom * 0.45;
  }
  const pad = o.overlay ? fs * 1.1 : 0;
  ctx.textBaseline = 'middle';
  const font = (w: number, size: number, fam = o.fam) => `${w} ${Math.round(size)}px ${fam}`;
  const titleText = [lines.title, o.layout === 'split' ? '' : lines.lens].filter(Boolean).join('  ·  ');

  if (o.layout === 'split') {
    const twoRows = !!(lines.lens || lines.extra);
    const y1 = twoRows ? cy - fs * 0.62 : cy, y2 = cy + fs * 0.72;
    ctx.textAlign = 'left';
    ctx.fillStyle = o.textColor; ctx.font = font(650, fs); fitText(ctx, lines.title || lines.lens, left + pad, y1, pw * 0.48);
    if (lines.title && lines.lens) { ctx.fillStyle = o.subColor; ctx.font = font(400, fs * 0.78); fitText(ctx, lines.lens, left + pad, y2, pw * 0.48); }
    ctx.textAlign = 'right';
    ctx.fillStyle = o.textColor; ctx.font = font(500, fs * 0.86, o.style === 'filmstrip' || o.style === 'darkroom' ? o.mono : o.fam);
    fitText(ctx, lines.specs, right - pad, lines.specs ? y1 : y2, pw * 0.5);
    if (lines.extra) { ctx.fillStyle = o.subColor; ctx.font = font(400, fs * 0.74); fitText(ctx, lines.extra, right - pad, y2, pw * 0.5); }
    return;
  }
  const rows = [
    titleText && { t: titleText, f: font(650, fs), c: o.textColor },
    lines.specs && { t: lines.specs, f: font(450, fs * 0.8), c: o.subColor },
    lines.extra && { t: lines.extra, f: font(400, fs * 0.74), c: o.subColor },
  ].filter(Boolean) as { t: string; f: string; c: string }[];
  const lh = fs * 1.35;
  let y = cy - ((rows.length - 1) * lh) / 2;
  ctx.textAlign = o.layout === 'center' ? 'center' : 'left';
  const x = o.layout === 'center' ? L.x + pw / 2 : left + pad;
  for (const r of rows) { ctx.font = r.f; ctx.fillStyle = r.c; fitText(ctx, r.t, x, y, pw - pad * 2); y += lh; }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number) {
  if (!text) return;
  ctx.fillText(text, x, y, max);
}

function drawSprockets(ctx: CanvasRenderingContext2D, L: ReturnType<typeof layout>, pw: number, ph: number, st: StyleDef, fonts: Fonts, lookName?: string) {
  const hole = L.unit * 0.9, gap = hole * 0.9;
  ctx.fillStyle = '#e9e6df';
  for (const y of [L.y - L.unit * 1.75, L.y + ph + L.unit * 0.85]) {
    for (let x = L.unit * 0.5; x < L.W - hole; x += hole + gap) { roundRect(ctx, x, y, hole, hole * 1.15, hole * 0.18); ctx.fill(); }
  }
  ctx.fillStyle = st.text; ctx.font = `600 ${Math.round(L.unit * 0.55)}px ${fonts.mono}`; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillText(`${(lookName || 'SNAPFRAME').toUpperCase()}  ▸  24`, L.x, L.y - L.unit * 0.5);
  ctx.textAlign = 'right'; ctx.fillText('24A  ◂', L.x + pw, L.y - L.unit * 0.5);
}

function drawDateStamp(ctx: CanvasRenderingContext2D, L: ReturnType<typeof layout>, pw: number, ph: number, meta: Meta, fonts: Fonts) {
  const d = meta.date ? new Date(meta.date.replace(/\./g, '-')) : new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const txt = isNaN(d.getTime()) ? meta.date : `'${p(d.getFullYear() % 100)}  ${p(d.getMonth() + 1)}  ${p(d.getDate())}`;
  const fs = Math.max(pw, ph) * 0.032;
  ctx.font = `600 ${Math.round(fs)}px ${fonts.mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,120,30,.9)'; ctx.shadowBlur = fs * 0.5;
  ctx.fillStyle = '#ffa63d'; ctx.fillText(txt, L.x + pw - fs * 1.4, L.y + ph - fs * 1.2);
  ctx.shadowBlur = 0;
}

function drawMark(ctx: CanvasRenderingContext2D, L: ReturnType<typeof layout>, pw: number, ph: number, m: MarkSettings, logo: Img | null, fonts: Fonts) {
  const margin = Math.min(pw, ph) * 0.04;
  const w = pw * m.size;
  let mw: number, mh: number;
  if (m.kind === 'logo' && logo) { mw = w; mh = (logo.height / logo.width) * w; }
  else if (m.kind === 'text' && m.text.trim()) {
    const fs = w * (m.font === 'script' ? 0.32 : 0.24);
    ctx.font = `${m.font === 'script' ? 500 : 600} ${Math.round(fs)}px ${fonts[m.font]}`;
    mw = ctx.measureText(m.text).width; mh = fs;
  } else return;
  const [v, h] = [m.pos[0], m.pos[1]];
  const x = h === 'l' ? L.x + margin : h === 'r' ? L.x + pw - margin - mw : L.x + (pw - mw) / 2;
  const y = v === 't' ? L.y + margin : v === 'b' ? L.y + ph - margin - mh : L.y + (ph - mh) / 2;
  ctx.save();
  ctx.globalAlpha = m.opacity;
  if (m.kind === 'logo' && logo) ctx.drawImage(logo, x, y, mw, mh);
  else {
    ctx.fillStyle = m.color; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.shadowColor = isDark(m.color) ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)'; ctx.shadowBlur = mh * 0.15;
    ctx.fillText(m.text, x, y);
  }
  ctx.restore();
}

export function isDark(hex: string): boolean {
  const m = hex.replace('#', '').slice(0, 6);
  if (m.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}
function withAlpha(hex: string, a: number) {
  const m = hex.replace('#', '').slice(0, 6);
  return `#${m}${Math.round(a * 255).toString(16).padStart(2, '0')}`;
}
