import type { Grade } from './looks';

/**
 * GPU colour pipeline (WebGL2). One fragment shader applies the whole grade in a single pass,
 * so the preview updates in about a millisecond and full-resolution exports take a fraction of a second.
 */
const VERT = `#version 300 es
in vec2 a_pos; out vec2 v_uv;
void main() { v_uv = vec2(a_pos.x * .5 + .5, .5 - a_pos.y * .5); gl_Position = vec4(a_pos, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform sampler2D u_img;
uniform vec2 u_texel, u_size;
uniform float u_exposure, u_contrast, u_highlights, u_shadows, u_temp, u_tint, u_sat, u_vib, u_fade, u_split,
  u_mono, u_grain, u_grainSize, u_vignette, u_halation, u_sharpen, u_seed, u_haloLod;
uniform vec3 u_lift, u_gain, u_shTint, u_hiTint, u_monoMix;

float luma(vec3 c) { return dot(c, vec3(.2126, .7152, .0722)); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec3 c = texture(u_img, v_uv).rgb;
  if (u_sharpen > 0.) {
    vec3 n = texture(u_img, v_uv + vec2(u_texel.x, 0.)).rgb + texture(u_img, v_uv - vec2(u_texel.x, 0.)).rgb
           + texture(u_img, v_uv + vec2(0., u_texel.y)).rgb + texture(u_img, v_uv - vec2(0., u_texel.y)).rgb;
    c = clamp(c + (c - n * .25) * u_sharpen * 1.6, 0., 1.);
  }
  // linear light: exposure, white balance, halation
  vec3 lin = pow(c, vec3(2.2)) * exp2(u_exposure);
  lin *= vec3(1. + u_temp * .2, 1. - u_tint * .12, 1. - u_temp * .2);
  if (u_halation > 0.) {
    vec3 b = pow(textureLod(u_img, v_uv, u_haloLod).rgb, vec3(2.2));
    lin += vec3(1., .22, .06) * smoothstep(.45, 1., luma(b)) * u_halation;
  }
  c = pow(max(lin, 0.), vec3(1. / 2.2));

  // tone: highlights / shadows / contrast
  float L = luma(c);
  float hm = smoothstep(.4, 1., L), sm = 1. - smoothstep(0., .6, L);
  c *= 1. + u_highlights * .45 * hm;
  c += u_shadows * .3 * sm * (1. - c);
  c = clamp(c, 0., 1.);
  if (u_contrast >= 0.) c = mix(c, c * c * (3. - 2. * c), u_contrast);
  else c = mix(c, .5 + (c - .5) * .45, -u_contrast);

  // film response: per-channel lift / gain, split toning
  c = c * u_gain + u_lift * (1. - c);
  L = luma(c);
  c += (u_shTint - .5) * u_split * .35 * (1. - L) * (1. - L) + (u_hiTint - .5) * u_split * .35 * L * L;

  // colour: saturation & vibrance, black & white
  L = luma(c);
  float chroma = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  c = mix(vec3(L), c, max(0., (1. + u_sat) * (1. + u_vib * (1. - chroma))));
  float m = dot(clamp(c, 0., 1.), u_monoMix / max(dot(u_monoMix, vec3(1.)), 1e-3));
  c = mix(c, vec3(m), u_mono);

  // fade (lifted blacks)
  c = u_fade + c * (1. - u_fade * .7);

  // vignette (aspect-correct)
  vec2 d = (v_uv - .5) * vec2(u_size.x / max(u_size.x, u_size.y), u_size.y / max(u_size.x, u_size.y));
  float v = smoothstep(.75, .15, length(d));
  if (u_vignette >= 0.) c *= mix(1., v, u_vignette);
  else c = mix(c, vec3(1.), (1. - v) * -u_vignette);

  // grain: sized relative to the image, so preview and export look the same
  if (u_grain > 0.) {
    vec2 gp = v_uv * vec2(u_size.x / u_size.y, 1.) * (900. / u_grainSize) + u_seed;
    float g = vnoise(gp) + vnoise(gp * 2.1 + 17.) * .5 - .75;
    float mid = 1. - abs(luma(c) - .5) * 1.4;
    c += g * u_grain * .16 * max(mid, .25);
  }
  o = vec4(clamp(c, 0., 1.), 1.);
}`;

export class GradeRenderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private tex: WebGLTexture;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private srcKey: unknown = null;
  private srcW = 0;
  private srcH = 0;
  readonly maxSize: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    const gl = this.canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false });
    if (!gl) throw new Error('WebGL2 is not available in this browser');
    this.gl = gl;
    this.maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader error');
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link error');
    this.prog = p;
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, 'a_pos');
    gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const n of ['u_img', 'u_texel', 'u_size', 'u_exposure', 'u_contrast', 'u_highlights', 'u_shadows', 'u_temp', 'u_tint', 'u_sat', 'u_vib',
      'u_fade', 'u_split', 'u_mono', 'u_grain', 'u_grainSize', 'u_vignette', 'u_halation', 'u_sharpen', 'u_seed', 'u_haloLod',
      'u_lift', 'u_gain', 'u_shTint', 'u_hiTint', 'u_monoMix']) this.loc[n] = gl.getUniformLocation(p, n);
  }

  /** Uploads a source image; skipped when the same source (by key) is already on the GPU. */
  setSource(src: TexImageSource & { width: number; height: number }, key: unknown) {
    if (key === this.srcKey) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    this.srcKey = key; this.srcW = src.width; this.srcH = src.height;
  }

  /** Renders the graded image into this.canvas at w×h and returns the canvas. */
  render(g: Grade, w: number, h: number, seed = 0.37): HTMLCanvasElement {
    const gl = this.gl, L = this.loc;
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.prog);
    gl.uniform1i(L.u_img, 0);
    gl.uniform2f(L.u_texel, 1 / this.srcW, 1 / this.srcH);
    gl.uniform2f(L.u_size, w, h);
    const f = (n: string, v: number) => gl.uniform1f(L[n], v);
    f('u_exposure', g.exposure); f('u_contrast', g.contrast); f('u_highlights', g.highlights); f('u_shadows', g.shadows);
    f('u_temp', g.temperature); f('u_tint', g.tint); f('u_sat', g.saturation); f('u_vib', g.vibrance); f('u_fade', g.fade);
    f('u_split', g.splitAmount); f('u_mono', g.mono); f('u_grain', g.grain); f('u_grainSize', g.grainSize); f('u_vignette', g.vignette);
    f('u_halation', g.halation); f('u_sharpen', g.sharpen); f('u_seed', seed * 97);
    f('u_haloLod', Math.max(2, Math.log2(Math.max(this.srcW, this.srcH) / 48)));
    gl.uniform3fv(L.u_lift, g.lift); gl.uniform3fv(L.u_gain, g.gain); gl.uniform3fv(L.u_shTint, g.shadowTint);
    gl.uniform3fv(L.u_hiTint, g.highlightTint); gl.uniform3fv(L.u_monoMix, g.monoMix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return this.canvas;
  }
}

let shared: GradeRenderer | null = null;
/** One WebGL context for the whole app (browsers cap how many can exist). */
export function renderer(): GradeRenderer { return (shared ??= new GradeRenderer()); }
