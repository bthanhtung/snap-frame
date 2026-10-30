import { DEFAULT_FRAME, layout, metaLines, STYLES, type Meta } from './frame';
import { cameraName, prettyLens } from './image';
import { LOOKS, NEUTRAL, resolveGrade } from './looks';

describe('looks', () => {
  it('have unique ids and only known parameters', () => {
    expect(new Set(LOOKS.map(l => l.id)).size).toBe(LOOKS.length);
    for (const l of LOOKS) for (const k of Object.keys(l.grade)) expect(k in NEUTRAL).toBe(true);
  });
  it('strength 0 is neutral, 1 is the look', () => {
    expect(resolveGrade('ektar100', 0, {})).toEqual(NEUTRAL);
    const g = resolveGrade('ektar100', 1, {});
    expect(g.saturation).toBeCloseTo(0.28);
    expect(resolveGrade('ektar100', 0.5, {}).saturation).toBeCloseTo(0.14);
  });
  it('black & white stays black & white at any strength', () => {
    expect(resolveGrade('trix400', 0.2, {}).mono).toBe(1);
    expect(resolveGrade('portra400', 1, {}).mono).toBe(0);
  });
  it('manual adjustments stack on the look and are clamped where needed', () => {
    const g = resolveGrade('portra400', 1, { saturation: 0.3, grain: -1 });
    expect(g.saturation).toBeCloseTo(-0.08 + 0.3);
    expect(g.grain).toBe(0);
  });
});

describe('frame layout', () => {
  it('adds margins with a deeper caption band', () => {
    const L = layout(1000, 800, DEFAULT_FRAME);
    expect(L.x).toBeGreaterThan(0);
    expect(L.bottom).toBeGreaterThan(L.top * 2);
    expect(L.W).toBe(Math.round(1000 + 2 * L.x));
  });
  it('fills the requested aspect ratio exactly', () => {
    for (const [a, r] of [['1:1', 1], ['4:5', 0.8], ['9:16', 9 / 16], ['16:9', 16 / 9]] as const) {
      const L = layout(1200, 800, { ...DEFAULT_FRAME, aspect: a });
      expect(L.W / L.H).toBeCloseTo(r, 2);
    }
  });
  it('keeps an even frame when the caption is hidden', () => {
    const L = layout(1000, 1000, { ...DEFAULT_FRAME, layout: 'none' });
    expect(Math.round(L.bottom)).toBe(Math.round(L.top));
  });
  it('no-frame style adds nothing', () => {
    const L = layout(1000, 700, { ...DEFAULT_FRAME, style: 'none' });
    expect([L.W, L.H, L.x, L.y]).toEqual([1000, 700, 0, 0]);
  });
  it('every style is defined', () => { for (const s of Object.values(STYLES)) expect(s.pad).toHaveLength(4); });
});

describe('captions', () => {
  const meta: Meta = { camera: 'Nikon D750', lens: '24-120mm f/4', focal: '120mm', aperture: 'f/8', shutter: '1/640s', iso: '320', date: '2024.11.12', location: 'Ha Long', author: '' };
  it('builds lines only from ticked, non-empty fields', () => {
    const l = metaLines(meta, ['camera', 'focal', 'aperture', 'iso', 'author', 'location']);
    expect(l.title).toBe('Nikon D750');
    expect(l.lens).toBe('');
    expect(l.specs).toBe('120mm   f/8   ISO 320');
    expect(l.extra).toBe('Ha Long');
  });
  it('formats camera makers and lenses', () => {
    expect(cameraName('Nikon', 'NIKON D750')).toBe('Nikon D750');
    expect(cameraName('Sony', 'DSC-RX1')).toBe('Sony DSC-RX1');
    expect(cameraName('Apple', 'iPhone 15 Pro')).toBe('Apple iPhone 15 Pro');
    expect(prettyLens('24.0-120.0 mm f/4.0')).toBe('24-120mm f/4');
  });
});
