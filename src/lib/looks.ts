/**
 * Colour grading parameters and the film-inspired looks built from them.
 *
 * Every look is a set of the same parameters the user can move by hand, so a look is just a starting
 * point: "strength" interpolates between neutral and the look, and manual adjustments stack on top.
 * The looks are interpretations of how these stocks are commonly remembered, not scientific emulations,
 * and are not affiliated with the film manufacturers.
 */
export type Vec3 = [number, number, number];

export interface Grade {
  exposure: number;      // stops, -2..2
  contrast: number;      // -1..1
  highlights: number;    // -1..1
  shadows: number;       // -1..1
  temperature: number;   // -1 (cool) .. 1 (warm)
  tint: number;          // -1 (green) .. 1 (magenta)
  saturation: number;    // -1..1
  vibrance: number;      // -1..1
  fade: number;          // 0..0.3, lifts the black point
  lift: Vec3;            // per-channel shadow offset   (-0.1..0.1)
  gain: Vec3;            // per-channel highlight scale (0.85..1.15)
  shadowTint: Vec3;      // split toning colour for shadows (rgb 0..1)
  highlightTint: Vec3;   // split toning colour for highlights
  splitAmount: number;   // 0..1
  mono: number;          // 0 colour, 1 black & white
  monoMix: Vec3;         // channel mixer used for black & white
  grain: number;         // 0..1
  grainSize: number;     // 1..3
  vignette: number;      // -1..1 (negative = white vignette)
  halation: number;      // 0..1, red glow around highlights (CineStill)
  sharpen: number;       // 0..1
  hueShift: Vec3;        // hue rotation for warm / green / blue tones, in turns (-0.5..0.5)
  satRange: Vec3;        // saturation change for warm / green / blue tones (-1..1)
}

export const NEUTRAL: Grade = {
  exposure: 0, contrast: 0, highlights: 0, shadows: 0, temperature: 0, tint: 0, saturation: 0, vibrance: 0, fade: 0,
  lift: [0, 0, 0], gain: [1, 1, 1], shadowTint: [0.5, 0.5, 0.5], highlightTint: [0.5, 0.5, 0.5], splitAmount: 0,
  mono: 0, monoMix: [0.3, 0.59, 0.11], grain: 0, grainSize: 1.4, vignette: 0, halation: 0, sharpen: 0,
  hueShift: [0, 0, 0], satRange: [0, 0, 0],
};

export type Brand = 'Kodak' | 'Fujifilm' | 'Black & White' | 'Cinema' | 'Instant & Vintage' | 'Creative';
export interface Look { id: string; name: string; brand: Brand; note: string; grade: Partial<Grade> }

const warmHi: Vec3 = [1, 0.82, 0.55], coolSh: Vec3 = [0.25, 0.45, 0.6], teal: Vec3 = [0.2, 0.55, 0.55];
const orange: Vec3 = [1, 0.7, 0.4], sepiaHi: Vec3 = [1, 0.82, 0.55], sepiaSh: Vec3 = [0.6, 0.45, 0.3];
const L = (id: string, name: string, brand: Brand, note: string, grade: Partial<Grade>): Look => ({ id, name, brand, note, grade });

export const LOOKS: Look[] = [
  // ---------- Kodak ----------
  L('portra400', 'Portra 400', 'Kodak', 'Warm, soft contrast, flattering skin', { contrast: -0.12, highlights: -0.25, shadows: 0.15, temperature: 0.12, saturation: -0.08, vibrance: 0.1, fade: 0.035, lift: [0.012, 0.006, -0.004], gain: [1.02, 1, 0.96], highlightTint: warmHi, shadowTint: [0.45, 0.42, 0.38], splitAmount: 0.18, grain: 0.18 }),
  L('portra160', 'Portra 160', 'Kodak', 'Clean, pastel, fine grain', { contrast: -0.15, highlights: -0.2, shadows: 0.12, temperature: 0.05, saturation: -0.15, fade: 0.04, gain: [1.01, 1, 0.98], highlightTint: [1, 0.9, 0.75], splitAmount: 0.1, grain: 0.08 }),
  L('portra800', 'Portra 800', 'Kodak', 'Low-light warmth, richer colour, visible grain', { contrast: -0.05, highlights: -0.2, shadows: 0.12, temperature: 0.16, saturation: 0.05, vibrance: 0.12, fade: 0.03, gain: [1.03, 1, 0.94], highlightTint: warmHi, splitAmount: 0.2, grain: 0.34 }),
  L('ektar100', 'Ektar 100', 'Kodak', 'Vivid colour, punchy reds and blues', { contrast: 0.18, saturation: 0.28, vibrance: 0.15, temperature: 0.04, gain: [1.04, 1, 1.02], lift: [0, -0.004, 0.006], satRange: [0.15, 0.05, 0.2], grain: 0.06 }),
  L('gold200', 'Gold 200', 'Kodak', 'Golden, nostalgic summer', { contrast: 0.06, temperature: 0.28, tint: -0.03, saturation: 0.1, fade: 0.025, gain: [1.04, 1.01, 0.9], highlightTint: [1, 0.78, 0.4], splitAmount: 0.22, grain: 0.22 }),
  L('colorplus', 'ColorPlus 200', 'Kodak', 'Budget film charm: warm, slightly muddy greens', { contrast: 0.08, temperature: 0.2, saturation: 0.02, fade: 0.04, hueShift: [0, -0.02, 0], satRange: [0.1, -0.2, -0.1], gain: [1.03, 1, 0.92], grain: 0.26 }),
  L('ultramax400', 'UltraMax 400', 'Kodak', 'Everyday consumer film, warm and saturated', { contrast: 0.12, temperature: 0.16, saturation: 0.16, fade: 0.02, gain: [1.03, 1, 0.93], lift: [0.01, 0.004, -0.006], grain: 0.3 }),
  L('ektachrome', 'Ektachrome E100', 'Kodak', 'Clean slide film, cool and crisp', { contrast: 0.2, temperature: -0.08, saturation: 0.15, vibrance: 0.1, satRange: [0, 0.1, 0.2], grain: 0.05, sharpen: 0.15 }),
  L('kodachrome64', 'Kodachrome 64', 'Kodak', 'Deep reds, cool shadows, classic slide film', { contrast: 0.22, highlights: -0.1, saturation: 0.18, temperature: 0.05, gain: [1.05, 0.99, 0.96], lift: [-0.006, 0, 0.012], shadowTint: coolSh, highlightTint: [1, 0.85, 0.65], splitAmount: 0.2, satRange: [0.2, 0, 0.1], grain: 0.1, vignette: 0.12 }),
  L('aerochrome', 'Aerochrome', 'Kodak', 'Infrared false colour: foliage turns red and pink', { contrast: 0.15, saturation: 0.2, hueShift: [0, -0.32, 0.02], satRange: [0.15, 0.6, 0.1], tint: 0.05, grain: 0.15 }),
  // ---------- Fujifilm ----------
  L('classicchrome', 'Classic Chrome', 'Fujifilm', 'Muted documentary colour', { contrast: 0.14, highlights: -0.08, shadows: -0.05, saturation: -0.3, temperature: -0.02, lift: [-0.004, 0.004, 0.01], gain: [1.02, 1, 0.97], shadowTint: teal, highlightTint: [1, 0.9, 0.78], splitAmount: 0.18, satRange: [0, -0.2, -0.1], grain: 0.1 }),
  L('classicneg', 'Classic Negative', 'Fujifilm', 'Hard tones, cyan shadows, nostalgic', { contrast: 0.24, highlights: -0.15, saturation: -0.12, temperature: 0.02, fade: 0.04, lift: [-0.01, 0.008, 0.014], gain: [1.04, 0.99, 0.94], shadowTint: [0.15, 0.5, 0.55], highlightTint: [1, 0.85, 0.7], splitAmount: 0.3, hueShift: [0, 0.03, 0], grain: 0.18 }),
  L('nostalgicneg', 'Nostalgic Neg.', 'Fujifilm', 'Amber highlights, soft and dreamy', { contrast: 0.05, highlights: -0.2, shadows: 0.1, temperature: 0.18, saturation: -0.05, fade: 0.03, highlightTint: [1, 0.75, 0.45], splitAmount: 0.3, grain: 0.14 }),
  L('velvia50', 'Velvia 50', 'Fujifilm', 'Saturated landscapes, deep greens and blues', { contrast: 0.28, highlights: -0.05, saturation: 0.45, vibrance: 0.2, tint: 0.04, gain: [1.02, 1.01, 1.04], lift: [0, 0, 0.006], satRange: [0.1, 0.2, 0.25], vignette: 0.15, grain: 0.05 }),
  L('provia100', 'Provia 100F', 'Fujifilm', 'Faithful, clean and crisp', { contrast: 0.1, saturation: 0.08, vibrance: 0.08, grain: 0.04, sharpen: 0.2 }),
  L('astia', 'Astia', 'Fujifilm', 'Soft contrast, natural skin', { contrast: -0.06, highlights: -0.12, shadows: 0.1, saturation: 0.05, temperature: 0.06, gain: [1.02, 1, 0.98], grain: 0.05 }),
  L('pro400h', 'Pro 400H', 'Fujifilm', 'Airy pastels with mint shadows', { exposure: 0.15, contrast: -0.14, highlights: -0.3, shadows: 0.2, saturation: -0.12, temperature: -0.04, tint: -0.06, fade: 0.05, lift: [-0.006, 0.012, 0.01], shadowTint: [0.35, 0.6, 0.5], highlightTint: [1, 0.92, 0.88], splitAmount: 0.22, hueShift: [0, 0.03, 0], grain: 0.15 }),
  L('superia400', 'Superia 400', 'Fujifilm', 'Green-tinted everyday colour', { contrast: 0.12, saturation: 0.1, tint: -0.08, lift: [-0.004, 0.01, 0.004], gain: [1, 1.02, 0.98], shadowTint: [0.3, 0.55, 0.4], splitAmount: 0.15, grain: 0.26 }),
  L('c200', 'C200', 'Fujifilm', 'Cool, slightly green consumer film', { contrast: 0.08, temperature: -0.08, tint: -0.06, saturation: 0.02, fade: 0.03, lift: [-0.006, 0.008, 0.008], grain: 0.22 }),
  L('eterna', 'Eterna', 'Fujifilm', 'Cinematic, muted, gentle roll-off', { contrast: -0.12, highlights: -0.25, shadows: 0.12, saturation: -0.35, temperature: -0.03, fade: 0.03, shadowTint: teal, highlightTint: [1, 0.88, 0.75], splitAmount: 0.22, grain: 0.08 }),
  L('realaace', 'Reala Ace', 'Fujifilm', 'True-to-life colour with gentle contrast', { contrast: 0.04, highlights: -0.1, saturation: 0.06, vibrance: 0.06, grain: 0.04 }),
  // ---------- black & white ----------
  L('trix400', 'Tri-X 400', 'Black & White', 'Gritty, contrasty street classic', { mono: 1, contrast: 0.32, highlights: -0.1, monoMix: [0.35, 0.55, 0.1], grain: 0.42, grainSize: 1.6, vignette: 0.15 }),
  L('hp5', 'HP5 Plus', 'Black & White', 'Rich mid-tones, forgiving latitude', { mono: 1, contrast: 0.18, shadows: 0.08, monoMix: [0.3, 0.59, 0.11], grain: 0.35, grainSize: 1.5 }),
  L('acros', 'Acros 100', 'Black & White', 'Fine grain, deep blacks, silky tones', { mono: 1, contrast: 0.22, highlights: -0.08, monoMix: [0.25, 0.65, 0.1], grain: 0.12, grainSize: 1.1, sharpen: 0.2 }),
  L('tmax100', 'T-Max 100', 'Black & White', 'Smooth, modern, clean greys', { mono: 1, contrast: 0.12, monoMix: [0.3, 0.6, 0.1], grain: 0.06, grainSize: 1 }),
  L('delta3200', 'Delta 3200', 'Black & White', 'Huge grain, moody night shots', { mono: 1, contrast: 0.26, exposure: 0.1, fade: 0.04, monoMix: [0.32, 0.58, 0.1], grain: 0.7, grainSize: 2.2, vignette: 0.2 }),
  L('redfilter', 'Red filter', 'Black & White', 'Dark skies, bright skin — dramatic landscapes', { mono: 1, contrast: 0.3, monoMix: [0.8, 0.2, 0], grain: 0.15 }),
  L('highkey', 'High key', 'Black & White', 'Bright, airy, soft monochrome', { mono: 1, exposure: 0.35, contrast: -0.2, highlights: -0.1, shadows: 0.3, fade: 0.05, grain: 0.08 }),
  L('noir', 'Noir', 'Black & White', 'Crushed blacks, hard light, film noir', { mono: 1, contrast: 0.55, shadows: -0.25, exposure: -0.1, vignette: 0.4, grain: 0.25 }),
  L('sepia', 'Sepia', 'Black & White', 'Warm-toned antique print', { mono: 1, contrast: 0.08, fade: 0.06, shadowTint: sepiaSh, highlightTint: sepiaHi, splitAmount: 0.9, vignette: 0.25, grain: 0.2 }),
  L('selenium', 'Selenium', 'Black & White', 'Cool purple-brown darkroom toning', { mono: 1, contrast: 0.2, shadowTint: [0.45, 0.35, 0.5], highlightTint: [0.55, 0.52, 0.5], splitAmount: 0.6, grain: 0.15 }),
  L('cyanotype', 'Cyanotype', 'Black & White', 'Prussian-blue sun print', { mono: 1, contrast: 0.15, fade: 0.08, shadowTint: [0.05, 0.25, 0.55], highlightTint: [0.75, 0.85, 1], splitAmount: 1, grain: 0.1 }),
  // ---------- cinema ----------
  L('cinestill800t', 'CineStill 800T', 'Cinema', 'Tungsten night film with red halation', { temperature: -0.3, tint: 0.04, contrast: 0.1, highlights: -0.1, saturation: 0.05, lift: [0, 0.004, 0.016], halation: 0.55, shadowTint: [0.15, 0.35, 0.6], splitAmount: 0.15, grain: 0.32 }),
  L('cinestill50d', 'CineStill 50D', 'Cinema', 'Daylight cinema film, clean with soft glow', { contrast: 0.08, highlights: -0.15, saturation: 0.08, temperature: 0.03, halation: 0.25, grain: 0.08 }),
  L('tealorange', 'Teal & Orange', 'Cinema', 'Blockbuster skin-against-teal contrast', { contrast: 0.2, saturation: 0.05, shadowTint: [0.1, 0.5, 0.6], highlightTint: orange, splitAmount: 0.55, hueShift: [0.01, 0.06, -0.02], satRange: [0.15, -0.3, 0.1], grain: 0.08 }),
  L('bleach', 'Bleach bypass', 'Cinema', 'Silvery, desaturated, harsh contrast', { contrast: 0.45, saturation: -0.55, highlights: -0.1, shadows: -0.1, sharpen: 0.3, grain: 0.15 }),
  L('moody', 'Moody', 'Cinema', 'Dark, desaturated, cinematic', { exposure: -0.2, contrast: 0.15, highlights: -0.3, shadows: -0.1, saturation: -0.3, fade: 0.04, shadowTint: [0.25, 0.4, 0.45], splitAmount: 0.3, vignette: 0.3, grain: 0.12 }),
  L('neonnight', 'Neon Night', 'Cinema', 'Tokyo-at-night magentas and cyans', { contrast: 0.2, temperature: -0.15, tint: 0.15, saturation: 0.25, shadowTint: [0.35, 0.2, 0.6], highlightTint: [1, 0.6, 0.9], splitAmount: 0.35, halation: 0.3, grain: 0.18 }),
  L('dune', 'Desert', 'Cinema', 'Sun-baked orange, epic sci-fi palette', { contrast: 0.15, temperature: 0.4, saturation: -0.1, fade: 0.02, highlightTint: [1, 0.7, 0.4], shadowTint: [0.5, 0.38, 0.28], splitAmount: 0.4, satRange: [0.2, -0.6, -0.6], grain: 0.12 }),
  L('matrix', 'Code Green', 'Cinema', 'Sickly green tint, cyber thriller', { contrast: 0.25, tint: -0.35, saturation: -0.15, shadowTint: [0.2, 0.5, 0.3], splitAmount: 0.4, grain: 0.1 }),
  // ---------- instant & vintage ----------
  L('polaroid600', 'Polaroid 600', 'Instant & Vintage', 'Faded, warm, dreamy instant', { contrast: -0.1, highlights: -0.2, temperature: 0.12, tint: -0.04, saturation: -0.15, fade: 0.09, lift: [0.006, 0.014, 0.004], gain: [1.02, 1, 0.92], shadowTint: [0.35, 0.5, 0.4], highlightTint: [1, 0.9, 0.7], splitAmount: 0.25, vignette: 0.22, grain: 0.12 }),
  L('polaroidsx70', 'SX-70', 'Instant & Vintage', 'Soft, creamy, low-contrast integral film', { contrast: -0.2, highlights: -0.25, temperature: 0.18, saturation: -0.25, fade: 0.12, highlightTint: [1, 0.88, 0.7], splitAmount: 0.3, vignette: 0.3, grain: 0.1 }),
  L('instaxmini', 'Instax Mini', 'Instant & Vintage', 'Bright, cool, poppy instant', { exposure: 0.15, contrast: 0.08, temperature: -0.06, saturation: 0.12, fade: 0.04, vignette: 0.12, grain: 0.06 }),
  L('vista200', 'Vista 200', 'Instant & Vintage', 'Warm reds, magenta-leaning highlights', { contrast: 0.1, temperature: 0.12, tint: 0.06, saturation: 0.16, gain: [1.05, 0.98, 0.97], highlightTint: [1, 0.8, 0.8], splitAmount: 0.15, grain: 0.24 }),
  L('lomo', 'Lomo', 'Instant & Vintage', 'Cross-processed, heavy vignette', { contrast: 0.3, saturation: 0.35, tint: -0.05, lift: [-0.02, 0.01, 0.03], gain: [1.05, 1.03, 0.88], vignette: 0.45, grain: 0.2 }),
  L('crossproc', 'Cross process', 'Instant & Vintage', 'Slide film in negative chemistry: yellow highlights, blue shadows', { contrast: 0.3, saturation: 0.2, lift: [-0.02, 0, 0.06], gain: [1.02, 1.04, 0.82], hueShift: [0, -0.03, 0.02], grain: 0.15 }),
  L('70s', '1970s', 'Instant & Vintage', 'Faded orange print from a family album', { contrast: -0.08, temperature: 0.25, tint: 0.05, saturation: -0.2, fade: 0.1, highlightTint: [1, 0.75, 0.5], splitAmount: 0.35, satRange: [0.1, -0.3, -0.4], vignette: 0.25, grain: 0.25 }),
  L('80s', '1980s', 'Instant & Vintage', 'Punchy magenta-cast snapshot', { contrast: 0.15, tint: 0.12, saturation: 0.15, fade: 0.05, highlightTint: [1, 0.8, 0.9], splitAmount: 0.25, grain: 0.2 }),
  L('vhs', 'Camcorder', 'Instant & Vintage', 'Washed-out home video', { contrast: -0.1, saturation: -0.2, tint: -0.05, fade: 0.08, shadowTint: [0.3, 0.45, 0.55], splitAmount: 0.3, sharpen: 0.4, grain: 0.35, grainSize: 1 }),
  L('daguerre', 'Antique', 'Instant & Vintage', 'Heavily faded, stained, Victorian-era feel', { mono: 1, contrast: -0.05, fade: 0.14, shadowTint: [0.45, 0.4, 0.3], highlightTint: [0.9, 0.85, 0.65], splitAmount: 0.8, vignette: 0.55, grain: 0.35 }),
  // ---------- creative ----------
  L('goldenhour', 'Golden Hour', 'Creative', 'Glowing sunset warmth', { exposure: 0.05, contrast: 0.05, highlights: -0.2, temperature: 0.35, saturation: 0.1, highlightTint: [1, 0.72, 0.4], splitAmount: 0.35, halation: 0.15, vignette: 0.12 }),
  L('pastel', 'Pastel', 'Creative', 'Soft candy colours, lifted blacks', { exposure: 0.2, contrast: -0.25, highlights: -0.15, shadows: 0.25, saturation: -0.15, fade: 0.08, tint: 0.04, highlightTint: [1, 0.85, 0.92], splitAmount: 0.2 }),
  L('matte', 'Matte', 'Creative', 'Flat blacks, modern editorial', { contrast: -0.1, fade: 0.12, saturation: -0.1, highlights: -0.1 }),
  L('airy', 'Airy', 'Creative', 'Bright and clean, wedding-style', { exposure: 0.3, contrast: -0.1, highlights: -0.25, shadows: 0.3, temperature: 0.04, saturation: -0.05, satRange: [-0.1, -0.2, 0] }),
  L('nordic', 'Nordic', 'Creative', 'Cool, desaturated Scandinavian calm', { contrast: 0.05, temperature: -0.15, saturation: -0.35, fade: 0.05, shadowTint: [0.4, 0.45, 0.5], splitAmount: 0.2 }),
  L('forest', 'Forest', 'Creative', 'Deep emerald greens, earthy shadows', { contrast: 0.15, saturation: 0.05, hueShift: [0, 0.03, 0], satRange: [0, 0.3, -0.2], shadowTint: [0.3, 0.45, 0.35], splitAmount: 0.25, vignette: 0.2 }),
  L('ocean', 'Ocean', 'Creative', 'Turquoise water, clean sand', { contrast: 0.1, temperature: -0.05, saturation: 0.1, hueShift: [0, 0, -0.03], satRange: [0, 0, 0.4], highlights: -0.1 }),
  L('autumn', 'Autumn', 'Creative', 'Greens turn to amber and rust', { contrast: 0.1, temperature: 0.15, hueShift: [0, -0.08, 0], satRange: [0.25, 0.1, -0.3], grain: 0.1 }),
  L('saigon', 'Saigon Street', 'Creative', 'Humid warmth, punchy reds, teal shadows', { contrast: 0.18, temperature: 0.1, saturation: 0.15, shadowTint: [0.2, 0.45, 0.45], highlightTint: [1, 0.8, 0.6], splitAmount: 0.3, satRange: [0.2, -0.1, 0], grain: 0.18 }),
  L('kyoto', 'Kyoto', 'Creative', 'Quiet, muted greens and soft magenta', { contrast: -0.05, saturation: -0.2, tint: 0.06, fade: 0.05, satRange: [0, -0.2, -0.2], highlightTint: [1, 0.88, 0.9], splitAmount: 0.2, grain: 0.08 }),
  L('duotone', 'Duotone', 'Creative', 'Two-colour poster look', { mono: 1, contrast: 0.25, shadowTint: [0.2, 0.15, 0.6], highlightTint: [1, 0.55, 0.45], splitAmount: 1.2 }),
  L('popart', 'Pop', 'Creative', 'Loud, high-saturation fun', { contrast: 0.3, saturation: 0.6, vibrance: 0.3, satRange: [0.2, 0.2, 0.2] }),
];

export const BRANDS: Brand[] = ['Kodak', 'Fujifilm', 'Black & White', 'Cinema', 'Instant & Vintage', 'Creative'];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Neutral → look at `strength` (0..1), then the user's manual adjustments added on top. */
export function resolveGrade(lookId: string | null, strength: number, adjust: Partial<Grade>): Grade {
  const look = { ...NEUTRAL, ...(LOOKS.find(l => l.id === lookId)?.grade ?? {}) };
  const t = Math.max(0, Math.min(1, strength));
  const out = { ...NEUTRAL } as Grade;
  for (const k of Object.keys(NEUTRAL) as (keyof Grade)[]) {
    const n = NEUTRAL[k], l = look[k];
    (out as any)[k] = Array.isArray(n) ? lerp3(n as Vec3, l as Vec3, t) : lerp(n as number, l as number, t);
  }
  // mono switches abruptly so black & white looks stay black & white at any strength
  out.mono = look.mono > 0 ? 1 : 0;
  out.monoMix = look.monoMix;
  out.grainSize = look.grainSize;
  for (const [k, v] of Object.entries(adjust) as [keyof Grade, any][]) {
    if (typeof v === 'number' && typeof out[k] === 'number') (out as any)[k] = (out[k] as number) + v;
  }
  out.fade = Math.max(0, out.fade);
  out.grain = Math.max(0, Math.min(1, out.grain));
  out.halation = Math.max(0, out.halation);
  out.sharpen = Math.max(0, out.sharpen);
  return out;
}

/** Manual adjustment sliders (added to whatever the look sets). */
export const ADJUSTMENTS: { key: keyof Grade; label: string; min: number; max: number; step: number }[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.05 },
  { key: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.01 },
  { key: 'highlights', label: 'Highlights', min: -1, max: 1, step: 0.01 },
  { key: 'shadows', label: 'Shadows', min: -1, max: 1, step: 0.01 },
  { key: 'temperature', label: 'Temperature', min: -1, max: 1, step: 0.01 },
  { key: 'tint', label: 'Tint', min: -1, max: 1, step: 0.01 },
  { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.01 },
  { key: 'vibrance', label: 'Vibrance', min: -1, max: 1, step: 0.01 },
  { key: 'fade', label: 'Fade', min: -0.15, max: 0.3, step: 0.005 },
  { key: 'grain', label: 'Grain', min: -1, max: 1, step: 0.01 },
  { key: 'vignette', label: 'Vignette', min: -1, max: 1, step: 0.01 },
  { key: 'halation', label: 'Halation', min: -1, max: 1, step: 0.01 },
  { key: 'sharpen', label: 'Sharpen', min: -1, max: 1, step: 0.01 },
];
