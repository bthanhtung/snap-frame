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
}

export const NEUTRAL: Grade = {
  exposure: 0, contrast: 0, highlights: 0, shadows: 0, temperature: 0, tint: 0, saturation: 0, vibrance: 0, fade: 0,
  lift: [0, 0, 0], gain: [1, 1, 1], shadowTint: [0.5, 0.5, 0.5], highlightTint: [0.5, 0.5, 0.5], splitAmount: 0,
  mono: 0, monoMix: [0.3, 0.59, 0.11], grain: 0, grainSize: 1.4, vignette: 0, halation: 0, sharpen: 0,
};

export type Brand = 'Kodak' | 'Fujifilm' | 'Black & White' | 'Cine & Instant';
export interface Look { id: string; name: string; brand: Brand; note: string; grade: Partial<Grade> }

const warmHi: Vec3 = [1, 0.82, 0.55], coolSh: Vec3 = [0.25, 0.45, 0.6], teal: Vec3 = [0.2, 0.55, 0.55];

export const LOOKS: Look[] = [
  // ---------- Kodak ----------
  { id: 'portra400', name: 'Portra 400', brand: 'Kodak', note: 'Warm, soft contrast, flattering skin',
    grade: { contrast: -0.12, highlights: -0.25, shadows: 0.15, temperature: 0.12, saturation: -0.08, vibrance: 0.1, fade: 0.035,
      lift: [0.012, 0.006, -0.004], gain: [1.02, 1, 0.96], highlightTint: warmHi, shadowTint: [0.45, 0.42, 0.38], splitAmount: 0.18, grain: 0.18 } },
  { id: 'portra160', name: 'Portra 160', brand: 'Kodak', note: 'Clean, pastel, fine grain',
    grade: { contrast: -0.15, highlights: -0.2, shadows: 0.12, temperature: 0.05, saturation: -0.15, fade: 0.04,
      gain: [1.01, 1, 0.98], highlightTint: [1, 0.9, 0.75], splitAmount: 0.1, grain: 0.08 } },
  { id: 'ektar100', name: 'Ektar 100', brand: 'Kodak', note: 'Vivid colour, punchy reds and blues',
    grade: { contrast: 0.18, saturation: 0.28, vibrance: 0.15, temperature: 0.04, gain: [1.04, 1, 1.02], lift: [0, -0.004, 0.006], grain: 0.06 } },
  { id: 'gold200', name: 'Gold 200', brand: 'Kodak', note: 'Golden, nostalgic summer',
    grade: { contrast: 0.06, temperature: 0.28, tint: -0.03, saturation: 0.1, fade: 0.025, gain: [1.04, 1.01, 0.9],
      highlightTint: [1, 0.78, 0.4], splitAmount: 0.22, grain: 0.22 } },
  { id: 'ultramax400', name: 'UltraMax 400', brand: 'Kodak', note: 'Everyday consumer film, warm and saturated',
    grade: { contrast: 0.12, temperature: 0.16, saturation: 0.16, fade: 0.02, gain: [1.03, 1, 0.93], lift: [0.01, 0.004, -0.006], grain: 0.3 } },
  { id: 'kodachrome64', name: 'Kodachrome 64', brand: 'Kodak', note: 'Deep reds, cool shadows, classic slide film',
    grade: { contrast: 0.22, highlights: -0.1, saturation: 0.18, temperature: 0.05, gain: [1.05, 0.99, 0.96], lift: [-0.006, 0, 0.012],
      shadowTint: coolSh, highlightTint: [1, 0.85, 0.65], splitAmount: 0.2, grain: 0.1, vignette: 0.12 } },
  // ---------- Fujifilm ----------
  { id: 'classicchrome', name: 'Classic Chrome', brand: 'Fujifilm', note: 'Muted documentary colour',
    grade: { contrast: 0.14, highlights: -0.08, shadows: -0.05, saturation: -0.3, temperature: -0.02, lift: [-0.004, 0.004, 0.01],
      gain: [1.02, 1, 0.97], shadowTint: teal, highlightTint: [1, 0.9, 0.78], splitAmount: 0.18, grain: 0.1 } },
  { id: 'classicneg', name: 'Classic Negative', brand: 'Fujifilm', note: 'Hard tones, cyan shadows, nostalgic',
    grade: { contrast: 0.24, highlights: -0.15, saturation: -0.12, temperature: 0.02, fade: 0.04, lift: [-0.01, 0.008, 0.014],
      gain: [1.04, 0.99, 0.94], shadowTint: [0.15, 0.5, 0.55], highlightTint: [1, 0.85, 0.7], splitAmount: 0.3, grain: 0.18 } },
  { id: 'velvia50', name: 'Velvia 50', brand: 'Fujifilm', note: 'Saturated landscapes, deep greens and blues',
    grade: { contrast: 0.28, highlights: -0.05, saturation: 0.45, vibrance: 0.2, tint: 0.04, gain: [1.02, 1.01, 1.04], lift: [0, 0, 0.006], vignette: 0.15, grain: 0.05 } },
  { id: 'provia100', name: 'Provia 100F', brand: 'Fujifilm', note: 'Faithful, clean and crisp',
    grade: { contrast: 0.1, saturation: 0.08, vibrance: 0.08, grain: 0.04, sharpen: 0.2 } },
  { id: 'astia', name: 'Astia', brand: 'Fujifilm', note: 'Soft contrast, natural skin',
    grade: { contrast: -0.06, highlights: -0.12, shadows: 0.1, saturation: 0.05, temperature: 0.06, gain: [1.02, 1, 0.98], grain: 0.05 } },
  { id: 'pro400h', name: 'Pro 400H', brand: 'Fujifilm', note: 'Airy pastels with mint shadows',
    grade: { exposure: 0.15, contrast: -0.14, highlights: -0.3, shadows: 0.2, saturation: -0.12, temperature: -0.04, tint: -0.06, fade: 0.05,
      lift: [-0.006, 0.012, 0.01], shadowTint: [0.35, 0.6, 0.5], highlightTint: [1, 0.92, 0.88], splitAmount: 0.22, grain: 0.15 } },
  { id: 'superia400', name: 'Superia 400', brand: 'Fujifilm', note: 'Green-tinted everyday colour',
    grade: { contrast: 0.12, saturation: 0.1, tint: -0.08, lift: [-0.004, 0.01, 0.004], gain: [1, 1.02, 0.98], shadowTint: [0.3, 0.55, 0.4], splitAmount: 0.15, grain: 0.26 } },
  { id: 'eterna', name: 'Eterna', brand: 'Fujifilm', note: 'Cinematic, muted, gentle roll-off',
    grade: { contrast: -0.12, highlights: -0.25, shadows: 0.12, saturation: -0.35, temperature: -0.03, fade: 0.03,
      shadowTint: teal, highlightTint: [1, 0.88, 0.75], splitAmount: 0.22, grain: 0.08 } },
  // ---------- black & white ----------
  { id: 'trix400', name: 'Tri-X 400', brand: 'Black & White', note: 'Gritty, contrasty street classic',
    grade: { mono: 1, contrast: 0.32, highlights: -0.1, monoMix: [0.35, 0.55, 0.1], grain: 0.42, grainSize: 1.6, vignette: 0.15 } },
  { id: 'hp5', name: 'HP5 Plus', brand: 'Black & White', note: 'Rich mid-tones, forgiving latitude',
    grade: { mono: 1, contrast: 0.18, shadows: 0.08, monoMix: [0.3, 0.59, 0.11], grain: 0.35, grainSize: 1.5 } },
  { id: 'acros', name: 'Acros 100', brand: 'Black & White', note: 'Fine grain, deep blacks, silky tones',
    grade: { mono: 1, contrast: 0.22, highlights: -0.08, monoMix: [0.25, 0.65, 0.1], grain: 0.12, grainSize: 1.1, sharpen: 0.2 } },
  { id: 'tmax100', name: 'T-Max 100', brand: 'Black & White', note: 'Smooth, modern, clean greys',
    grade: { mono: 1, contrast: 0.12, monoMix: [0.3, 0.6, 0.1], grain: 0.06, grainSize: 1 } },
  // ---------- cine & instant ----------
  { id: 'cinestill800t', name: 'CineStill 800T', brand: 'Cine & Instant', note: 'Tungsten night film with red halation',
    grade: { temperature: -0.3, tint: 0.04, contrast: 0.1, highlights: -0.1, saturation: 0.05, lift: [0, 0.004, 0.016], halation: 0.55,
      shadowTint: [0.15, 0.35, 0.6], splitAmount: 0.15, grain: 0.32 } },
  { id: 'polaroid600', name: 'Polaroid 600', brand: 'Cine & Instant', note: 'Faded, warm, dreamy instant',
    grade: { contrast: -0.1, highlights: -0.2, temperature: 0.12, tint: -0.04, saturation: -0.15, fade: 0.09, lift: [0.006, 0.014, 0.004],
      gain: [1.02, 1, 0.92], shadowTint: [0.35, 0.5, 0.4], highlightTint: [1, 0.9, 0.7], splitAmount: 0.25, vignette: 0.22, grain: 0.12 } },
  { id: 'vista200', name: 'Vista 200', brand: 'Cine & Instant', note: 'Warm reds, magenta-leaning highlights',
    grade: { contrast: 0.1, temperature: 0.12, tint: 0.06, saturation: 0.16, gain: [1.05, 0.98, 0.97], highlightTint: [1, 0.8, 0.8], splitAmount: 0.15, grain: 0.24 } },
  { id: 'lomo', name: 'Lomo', brand: 'Cine & Instant', note: 'Cross-processed, heavy vignette',
    grade: { contrast: 0.3, saturation: 0.35, tint: -0.05, lift: [-0.02, 0.01, 0.03], gain: [1.05, 1.03, 0.88], vignette: 0.45, grain: 0.2 } },
];

export const BRANDS: Brand[] = ['Kodak', 'Fujifilm', 'Black & White', 'Cine & Instant'];

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
