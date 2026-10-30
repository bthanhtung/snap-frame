/**
 * Frame composition (Canvas 2D). Everything is sized relative to the photo, so the low-resolution
 * preview and the full-resolution export are pixel-for-pixel the same design.
 */
export type FrameStyle = 'none' | 'white' | 'black' | 'leica' | 'gallery' | 'polaroid' | 'instax' | 'filmstrip'
  | 'slide' | 'darkroom' | 'fuji' | 'blur' | 'datestamp'
  | 'minimal' | 'cream' | 'kraft' | 'editorial' | 'float' | 'museum' | 'wood' | 'gilded' | 'cinema' | 'film120'
  | 'blush' | 'sage' | 'sky' | 'mocha' | 'sunset' | 'aurora' | 'stamp' | 'deckle' | 'tape' | 'airmail' | 'neon';
export type FrameGroup = 'classic' | 'gallery' | 'film' | 'colour' | 'fun';
export const FRAME_GROUPS: FrameGroup[] = ['classic', 'gallery', 'film', 'colour', 'fun'];
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

type Lay = ReturnType<typeof layout>;
/** paint: draws the whole background (mat = background colour, custom = the user picked it). over: decorates after the photo. */
interface StyleDef {
  label: string; group: FrameGroup; bg: string; text: string; sub: string; pad: [number, number, number, number];
  font?: FontKind; textured?: boolean;
  band?: number;            // outer frame band (in units) that the caption must stay clear of
  shadow?: number;          // extra drop shadow under the photo
  photoMat?: number;        // white print border around the photo itself (in units)
  paint?(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, mat: string, custom: boolean): void;
  over?(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, o: { fonts: Fonts; lookName?: string; text: string }): void;
}
const even = (n: number, bottom: number): [number, number, number, number] => [n, n, bottom, n];
export const STYLES: Record<FrameStyle, StyleDef> = {
  // classic
  white:     { label: 'Classic', group: 'classic', bg: '#ffffff', text: '#18181b', sub: '#71717a', pad: even(1, 3.4) },
  black:     { label: 'Noir', group: 'classic', bg: '#0b0b0c', text: '#f4f4f5', sub: '#a1a1aa', pad: even(1, 3.4) },
  minimal:   { label: 'Minimal', group: 'classic', bg: '#ffffff', text: '#18181b', sub: '#71717a', pad: even(0.5, 0.5) },
  leica:     { label: 'Rangefinder', group: 'classic', bg: '#f6f1e9', text: '#1c1917', sub: '#78716c', pad: even(1, 3.4), font: 'serif', textured: true },
  fuji:      { label: 'Chroma', group: 'classic', bg: '#ffffff', text: '#14532d', sub: '#16a34a', pad: even(1, 3.4) },
  cream:     { label: 'Cream', group: 'classic', bg: '#f3ead8', text: '#3b2f22', sub: '#8a7a66', pad: even(1.2, 3.6), font: 'serif', textured: true },
  kraft:     { label: 'Kraft', group: 'classic', bg: '#b48c5c', text: '#2a1c0c', sub: '#4f3920', pad: even(1.4, 3.8), font: 'mono', textured: true },
  none:      { label: 'No frame', group: 'classic', bg: '#ffffff', text: '#ffffff', sub: '#ffffffcc', pad: [0, 0, 0, 0] },
  // gallery
  gallery:   { label: 'Gallery', group: 'gallery', bg: '#f4f2ee', text: '#27272a', sub: '#8a8580', pad: even(3.2, 4.6), font: 'serif', textured: true, shadow: 0.15 },
  editorial: { label: 'Editorial', group: 'gallery', bg: '#ffffff', text: '#18181b', sub: '#71717a', pad: even(1.6, 6.4), font: 'serif' },
  float:     { label: 'Floating', group: 'gallery', bg: '#e6e6e8', text: '#27272a', sub: '#71717a', pad: even(3, 4.4), shadow: 0.8, paint: gradientPaint(['#f4f4f6', '#cfd0d5']) },
  museum:    { label: 'Museum', group: 'gallery', bg: '#f7f5f0', text: '#27272a', sub: '#8a8580', pad: even(4.2, 5.6), font: 'serif', band: 0.7, paint: museumPaint },
  wood:      { label: 'Wood frame', group: 'gallery', bg: '#f5f1e8', text: '#3b2f22', sub: '#8a7a66', pad: even(3.6, 5), band: 1.4, paint: woodPaint },
  gilded:    { label: 'Gilded', group: 'gallery', bg: '#f3ecdc', text: '#3b2f1a', sub: '#8a7350', pad: even(3.8, 5.2), font: 'serif', band: 1.6, paint: gildedPaint },
  blur:      { label: 'Blur backdrop', group: 'gallery', bg: '#000000', text: '#ffffff', sub: '#ffffffb3', pad: even(2.4, 4), shadow: 0.6 },
  // film & instant
  polaroid:  { label: 'Polaroid', group: 'film', bg: '#fbfaf6', text: '#27272a', sub: '#71717a', pad: even(1.3, 7.6), font: 'script', textured: true },
  instax:    { label: 'Instax', group: 'film', bg: '#fffdf5', text: '#3f3f46', sub: '#a1a1aa', pad: even(1.6, 4.4), textured: true },
  filmstrip: { label: 'Film strip', group: 'film', bg: '#0e0d0c', text: '#f0b464', sub: '#b07c3c', pad: [3, 1.2, 3, 1.2], font: 'mono' },
  film120:   { label: '120 film', group: 'film', bg: '#0a0a0a', text: '#f0b464', sub: '#a87a40', pad: even(1.6, 3.2), font: 'mono', over: film120Over },
  slide:     { label: 'Slide mount', group: 'film', bg: '#efe4c9', text: '#3b2f1a', sub: '#8a7350', pad: even(2.6, 2.6), font: 'serif', textured: true },
  darkroom:  { label: 'Darkroom', group: 'film', bg: '#050505', text: '#e4e4e7', sub: '#71717a', pad: even(0.9, 3.2), font: 'mono' },
  cinema:    { label: 'Cinema', group: 'film', bg: '#000000', text: '#f4f4f5', sub: '#a1a1aa', pad: [2.6, 0, 2.6, 0] },
  datestamp: { label: 'Date stamp', group: 'film', bg: '#000000', text: '#ffffff', sub: '#ffffffcc', pad: [0, 0, 0, 0], font: 'mono' },
  // colour
  blush:     { label: 'Blush', group: 'colour', bg: '#f4d9d6', text: '#5b2b2b', sub: '#9b6a66', pad: even(1.4, 3.6), font: 'serif' },
  sage:      { label: 'Sage', group: 'colour', bg: '#d3dcc8', text: '#2f3b2a', sub: '#66735c', pad: even(1.4, 3.6), font: 'serif' },
  sky:       { label: 'Sky', group: 'colour', bg: '#d5e3ef', text: '#1f3347', sub: '#5b7389', pad: even(1.4, 3.6) },
  mocha:     { label: 'Mocha', group: 'colour', bg: '#3a2a22', text: '#f1e4d6', sub: '#b39c88', pad: even(1.4, 3.6), font: 'serif' },
  sunset:    { label: 'Sunset', group: 'colour', bg: '#f2706a', text: '#ffffff', sub: '#ffffffcc', pad: even(2.4, 4), shadow: 0.4, paint: gradientPaint(['#ffb36b', '#f2706a', '#7b4fa0']) },
  aurora:    { label: 'Aurora', group: 'colour', bg: '#1f7a7a', text: '#ffffff', sub: '#ffffffcc', pad: even(2.4, 4), shadow: 0.4, paint: gradientPaint(['#0f2b46', '#1f7a7a', '#7bd389']) },
  // fun
  stamp:     { label: 'Stamp', group: 'fun', bg: '#ffffff', text: '#27272a', sub: '#71717a', pad: even(2, 3.8), band: 0.8, paint: stampPaint },
  deckle:    { label: 'Deckle edge', group: 'fun', bg: '#f8f5ee', text: '#3b2f22', sub: '#8a7a66', pad: even(1.6, 3.8), band: 0.6, font: 'serif', textured: true, paint: decklePaint },
  tape:      { label: 'Scrapbook', group: 'fun', bg: '#ece5d8', text: '#3f3f46', sub: '#71717a', pad: even(2.6, 4.6), font: 'script', textured: true, shadow: 0.3, photoMat: 0.45, over: tapeOver },
  airmail:   { label: 'Air mail', group: 'fun', bg: '#f6f1e4', text: '#1f3a6e', sub: '#6b7a99', pad: even(1.8, 4), band: 0.7, font: 'script', textured: true, paint: airmailPaint },
  neon:      { label: 'Neon', group: 'fun', bg: '#0b0614', text: '#f5d0fe', sub: '#c084fc', pad: even(2, 3.8), font: 'mono', over: neonOver },
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
    if (st.paint) st.paint(ctx, L, pw, ph, bg, !!f.bg);
    else { ctx.fillStyle = bg; ctx.fillRect(0, 0, L.W, L.H); }
    if (st.textured && !f.bg) { ctx.globalAlpha = 1; ctx.fillStyle = ctx.createPattern(paper(), 'repeat')!; ctx.fillRect(0, 0, L.W, L.H); }
  }

  if (f.style === 'filmstrip') drawSprockets(ctx, L, pw, ph, st, fonts, lookName);

  // photo with optional radius / shadow / border
  const radius = f.radius * Math.min(pw, ph) * 0.12 + (f.style === 'slide' ? Math.min(pw, ph) * 0.03 : 0);
  const shadow = f.shadow + (st.shadow ?? 0);
  if (st.photoMat) {
    const m = L.unit * st.photoMat;
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.18 + shadow * 0.35})`; ctx.shadowBlur = L.unit * (0.6 + shadow * 2.4); ctx.shadowOffsetY = L.unit * shadow * 0.5;
    ctx.fillStyle = '#fdfcf9'; ctx.fillRect(L.x - m, L.y - m, pw + 2 * m, ph + 2 * m);
    ctx.restore();
  } else if (shadow > 0) {
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

  const lines = metaLines(meta, f.fields);
  st.over?.(ctx, L, pw, ph, { fonts, lookName, text: textColor });

  // caption
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
    const band = (st.band ?? 0) * L.unit;
    const capH = (f.textPos === 'top' ? L.top : L.bottom) - band;
    const overlay = capH < L.unit * 1.6;     // no room in the frame: write on the photo
    drawCaption(ctx, { L, pw, ph, lines, fam, mono: fonts.mono, layout: f.layout, textColor: overlay ? '#ffffff' : textColor, subColor: overlay ? '#ffffffcc' : subColor, overlay, top: f.textPos === 'top', style: f.style, band, inset: L.x < L.unit * 0.5 ? L.unit * 1.2 : 0 });
  }

  // signature / logo
  if (mark.kind !== 'none') drawMark(ctx, L, pw, ph, mark, logo ?? null, fonts);
  ctx.restore();
  return c;
}

function drawCaption(ctx: CanvasRenderingContext2D, o: {
  L: ReturnType<typeof layout>; pw: number; ph: number; lines: ReturnType<typeof metaLines>; fam: string; mono: string;
  layout: TextLayout; textColor: string; subColor: string; overlay: boolean; top: boolean; style: FrameStyle; band: number; inset: number;
}) {
  const { L, pw, ph, lines } = o;
  const fs = L.unit * (o.style === 'polaroid' ? 0.95 : 0.62);
  const left = L.x + o.inset, right = L.x + pw - o.inset;
  let cy: number;  // vertical centre of the caption band
  if (o.overlay) {
    const gh = ph * 0.22;
    const y0 = o.top ? L.y : L.y + ph - gh;
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + gh);
    grad.addColorStop(o.top ? 0 : 1, 'rgba(0,0,0,.55)'); grad.addColorStop(o.top ? 1 : 0, 'rgba(0,0,0,0)');
    ctx.save(); roundRect(ctx, L.x, L.y, pw, ph, 0); ctx.clip(); ctx.fillStyle = grad; ctx.fillRect(L.x, y0, pw, gh); ctx.restore();
    cy = o.top ? L.y + fs * 1.6 : L.y + ph - fs * 1.6;
  } else {
    cy = o.top ? L.y - (L.top - o.band) / 2 : L.y + ph + (L.bottom - o.band) / 2;
    if (o.style === 'polaroid') cy = L.y + ph + L.bottom * 0.45;
    if (o.style === 'tape') cy += L.unit * 0.25;
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
  for (const r of rows) { ctx.font = r.f; ctx.fillStyle = r.c; fitText(ctx, r.t, x, y, pw - pad * 2 - o.inset * 2); y += lh; }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number) {
  if (!text) return;
  ctx.fillText(text, x, y, max);
}

function drawSprockets(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, st: StyleDef, fonts: Fonts, lookName?: string) {
  const hole = L.unit * 0.9, gap = hole * 0.9;
  ctx.fillStyle = '#e9e6df';
  for (const y of [L.y - L.unit * 1.75, L.y + ph + L.unit * 0.85]) {
    for (let x = L.unit * 0.5; x < L.W - hole; x += hole + gap) { roundRect(ctx, x, y, hole, hole * 1.15, hole * 0.18); ctx.fill(); }
  }
  ctx.fillStyle = st.text; ctx.font = `600 ${Math.round(L.unit * 0.55)}px ${fonts.mono}`; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillText(`${(lookName || 'SNAPFRAME').toUpperCase()}  ▸  24`, L.x, L.y - L.unit * 0.5);
  ctx.textAlign = 'right'; ctx.fillText('24A  ◂', L.x + pw, L.y - L.unit * 0.5);
}

function drawDateStamp(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, meta: Meta, fonts: Fonts) {
  const d = meta.date ? new Date(meta.date.replace(/\./g, '-')) : new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const txt = isNaN(d.getTime()) ? meta.date : `'${p(d.getFullYear() % 100)}  ${p(d.getMonth() + 1)}  ${p(d.getDate())}`;
  const fs = Math.max(pw, ph) * 0.032;
  ctx.font = `600 ${Math.round(fs)}px ${fonts.mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,120,30,.9)'; ctx.shadowBlur = fs * 0.5;
  ctx.fillStyle = '#ffa63d'; ctx.fillText(txt, L.x + pw - fs * 1.4, L.y + ph - fs * 1.2);
  ctx.shadowBlur = 0;
}

function drawMark(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, m: MarkSettings, logo: Img | null, fonts: Fonts) {
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

// ---------- decorative painters ----------
function rng(seed: number) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function gradientPaint(stops: string[]) {
  return (ctx: CanvasRenderingContext2D, L: Lay, _pw: number, _ph: number, mat: string, custom: boolean) => {
    if (custom) { ctx.fillStyle = mat; ctx.fillRect(0, 0, L.W, L.H); return; }
    const g = ctx.createLinearGradient(0, 0, L.W, L.H);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, L.W, L.H);
  };
}

/** Shadow cast inwards from the edges of a rectangle (a mat sitting under a frame). */
function innerShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, size: number, alpha = 0.35) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`; ctx.shadowBlur = size; ctx.lineWidth = size; ctx.strokeStyle = '#000';
  ctx.strokeRect(x - size / 2, y - size / 2, w + size, h + size);
  ctx.restore();
}

/** Mat board with a bevelled window cut around the photo. */
function matWithBevel(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, mat: string, b: number) {
  ctx.fillStyle = mat; ctx.fillRect(b, b, L.W - 2 * b, L.H - 2 * b);
  innerShadow(ctx, b, b, L.W - 2 * b, L.H - 2 * b, L.unit * 0.5);
  const bev = L.unit * 0.22;
  ctx.fillStyle = isDark(mat) ? '#00000055' : '#ffffff'; ctx.fillRect(L.x - bev, L.y - bev, pw + 2 * bev, ph + 2 * bev);
  ctx.strokeStyle = '#00000014'; ctx.lineWidth = Math.max(1, L.unit * 0.03); ctx.strokeRect(L.x - bev, L.y - bev, pw + 2 * bev, ph + 2 * bev);
}

function museumPaint(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, mat: string) {
  ctx.fillStyle = '#141414'; ctx.fillRect(0, 0, L.W, L.H);
  matWithBevel(ctx, L, pw, ph, mat, L.unit * 0.7);
}

function woodPaint(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, mat: string) {
  const g = ctx.createLinearGradient(0, 0, L.W, L.H);
  g.addColorStop(0, '#6b4325'); g.addColorStop(0.5, '#8d5c34'); g.addColorStop(1, '#5a371e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, L.W, L.H);
  const r = rng(11);
  ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = '#2a1608'; ctx.lineWidth = Math.max(1, L.unit * 0.05);
  for (let i = 0; i < 70; i++) {
    const y = r() * L.H, d = L.unit * 0.6;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(L.W * 0.3, y + (r() - 0.5) * d, L.W * 0.7, y + (r() - 0.5) * d, L.W, y + (r() - 0.5) * d); ctx.stroke();
  }
  ctx.restore();
  // mitred corners: a light edge on top/left, dark on bottom/right
  const b = L.unit * 1.4;
  ctx.fillStyle = '#ffffff18'; ctx.fillRect(0, 0, L.W, L.unit * 0.12); ctx.fillRect(0, 0, L.unit * 0.12, L.H);
  ctx.fillStyle = '#00000040'; ctx.fillRect(0, L.H - L.unit * 0.12, L.W, L.unit * 0.12); ctx.fillRect(L.W - L.unit * 0.12, 0, L.unit * 0.12, L.H);
  matWithBevel(ctx, L, pw, ph, mat, b);
}

function gildedPaint(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number, mat: string) {
  const g = ctx.createLinearGradient(0, 0, L.W, L.H);
  ['#7a5a20', '#e9cf7a', '#a37d33', '#f6e3a2', '#8a6a2a', '#d9b866', '#6e5019'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, L.W, L.H);
  const b = L.unit * 1.6;
  ctx.lineWidth = Math.max(1, L.unit * 0.1);
  for (const [k, c] of [[0.35, '#5a3f12aa'], [0.75, '#fff2c466'], [1.15, '#5a3f12aa']] as const) {
    ctx.strokeStyle = c; ctx.strokeRect(L.unit * k, L.unit * k, L.W - 2 * L.unit * k, L.H - 2 * L.unit * k);
  }
  matWithBevel(ctx, L, pw, ph, mat, b);
}

/** Punches a row of circles along each edge of a rectangle: postage-stamp perforations or deckled paper. */
function punch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, step: number, color: string, jitter = 0) {
  const rand = rng(5);
  ctx.fillStyle = color;
  const dot = (cx: number, cy: number) => { ctx.beginPath(); ctx.arc(cx, cy, r * (1 + (rand() - 0.5) * jitter), 0, Math.PI * 2); ctx.fill(); };
  const nx = Math.max(2, Math.round(w / step)), ny = Math.max(2, Math.round(h / step));
  for (let i = 0; i <= nx; i++) { dot(x + (w * i) / nx, y); dot(x + (w * i) / nx, y + h); }
  for (let j = 0; j <= ny; j++) { dot(x, y + (h * j) / ny); dot(x + w, y + (h * j) / ny); }
}

function stampPaint(ctx: CanvasRenderingContext2D, L: Lay, _pw: number, _ph: number, mat: string) {
  const outer = '#2a2a2e', m = L.unit * 0.8;
  ctx.fillStyle = outer; ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = mat; ctx.fillRect(m, m, L.W - 2 * m, L.H - 2 * m);
  punch(ctx, m, m, L.W - 2 * m, L.H - 2 * m, L.unit * 0.3, L.unit * 0.9, outer);
}

function decklePaint(ctx: CanvasRenderingContext2D, L: Lay, _pw: number, _ph: number, mat: string) {
  const outer = '#2b2622', m = L.unit * 0.6;
  ctx.fillStyle = outer; ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = mat; ctx.fillRect(m, m, L.W - 2 * m, L.H - 2 * m);
  punch(ctx, m, m, L.W - 2 * m, L.H - 2 * m, L.unit * 0.13, L.unit * 0.24, outer, 0.9);
}

function airmailPaint(ctx: CanvasRenderingContext2D, L: Lay, _pw: number, _ph: number, mat: string) {
  ctx.fillStyle = mat; ctx.fillRect(0, 0, L.W, L.H);
  const b = L.unit * 0.55;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, L.W, L.H); ctx.rect(b, b, L.W - 2 * b, L.H - 2 * b); ctx.clip('evenodd');
  const w = b * 1.4, colours = ['#c8343a', mat, '#1f4e9c', mat];
  for (let i = 0, x = -L.H; x < L.W; i++, x += w) {
    ctx.fillStyle = colours[i % 4];
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w + L.H, L.H); ctx.lineTo(x + L.H, L.H); ctx.fill();
  }
  ctx.restore();
}

function film120Over(ctx: CanvasRenderingContext2D, L: Lay, pw: number, _ph: number, o: { fonts: Fonts; lookName?: string; text: string }) {
  ctx.fillStyle = o.text; ctx.font = `600 ${Math.round(L.unit * 0.5)}px ${o.fonts.mono}`; ctx.textBaseline = 'middle';
  const y = L.y - L.unit * 0.8;
  ctx.textAlign = 'left'; ctx.fillText(`${(o.lookName || 'Portra 400').toUpperCase()}  120`, L.x, y, pw * 0.6);
  ctx.textAlign = 'right'; ctx.fillText('6  ▸', L.x + pw, y);
  ctx.beginPath(); ctx.moveTo(0, L.H / 2 - L.unit * 0.5); ctx.lineTo(L.unit * 0.6, L.H / 2); ctx.lineTo(0, L.H / 2 + L.unit * 0.5);
  ctx.fillStyle = '#f4f1ea'; ctx.fill();
}

function tapeOver(ctx: CanvasRenderingContext2D, L: Lay, pw: number) {
  const w = Math.max(pw * 0.2, L.unit * 4), h = L.unit * 1.1;
  for (const [cx, a] of [[L.x, -0.7], [L.x + pw, 0.7]] as const) {
    ctx.save();
    ctx.translate(cx, L.y); ctx.rotate(a);
    ctx.fillStyle = 'rgba(238,222,160,.82)'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let x = -w / 2; x < w / 2; x += h * 0.5) ctx.fillRect(x, -h / 2, h * 0.18, h);
    ctx.restore();
  }
}

function neonOver(ctx: CanvasRenderingContext2D, L: Lay, pw: number, ph: number) {
  const g = L.unit * 0.55;
  ctx.save();
  ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = Math.max(1, L.unit * 0.12);
  ctx.shadowColor = '#d946ef';
  for (const blur of [L.unit * 1.6, L.unit * 0.6]) { ctx.shadowBlur = blur; ctx.strokeRect(L.x - g, L.y - g, pw + 2 * g, ph + 2 * g); }
  ctx.restore();
}
