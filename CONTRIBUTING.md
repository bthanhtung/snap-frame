# Contributing

Thanks for helping improve SnapFrame. It is a static Next.js app: every photo is
decoded, graded, framed, and exported in the browser with WebGL2 and Canvas 2D.
There is no server and no API route.

## Development setup

Requires Node.js 22 or newer.

```bash
git clone https://github.com/bthanhtung/snap-frame.git
cd snap-frame
npm install
npm run dev          # http://localhost:3000
```

## Before you open a pull request

Run the same checks the maintainer runs:

```bash
npm run lint         # TypeScript type check
npm test             # Vitest unit tests
npm run build        # static export to ./out must succeed
```

For UI changes, try the app on a desktop browser and on a phone (or a mobile
emulator), and attach a screenshot or short GIF to the pull request.

## Where things live

```
src/lib/looks.ts   film looks: parameter sets, strength, adjustment stacking
src/lib/gl.ts      WebGL2 shader for colour, halation, grain, vignette
src/lib/frame.ts   frame composition (sized relative to the photo)
src/lib/image.ts   decoding (HEIC included), downscaling, EXIF captions
src/lib/render.ts  full-resolution export, ZIP, share
```

## Guidelines

- **Privacy first.** Photos never leave the device. Do not add analytics,
  uploads, or third-party requests that carry image data or EXIF.
- **Preview equals export.** Anything drawn on the preview must be sized
  relative to the photo so the exported file looks the same at every resolution.
- **New film looks** are parameter sets in `src/lib/looks.ts`. Describe the stock
  that inspired it, keep names generic (no trademarks as look names), and add a
  before/after screenshot to the pull request.
- **Performance.** The preview must stay smooth on a mid-range phone. Avoid
  heavy dependencies; check the bundle size after adding one.
- **Tests.** Pure functions in `src/lib` get unit tests in Vitest.
- **Compatibility.** Changes must keep working in current Chrome, Safari
  (macOS and iOS), and Firefox.

## Reporting bugs and requesting features

Open an issue with the steps you took, what you expected, what happened, and
your device, OS, and browser. For security issues, follow
[SECURITY.md](./SECURITY.md) instead of opening a public issue.
