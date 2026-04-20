"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDisplayMetadata = buildDisplayMetadata;
exports.calculatePadding = calculatePadding;
exports.getBackgroundRgb = getBackgroundRgb;
exports.generateFrameSvg = generateFrameSvg;
const PADDING_MAP = {
    sm: 40,
    md: 80,
    lg: 120,
    xl: 160,
};
const STYLE_CONFIG = {
    'white-minimal': {
        bg: '#FFFFFF',
        text: '#1A1A1A',
        secondaryText: '#666666',
        accentText: '#999999',
        font: 'Arial, Helvetica, sans-serif',
        fontWeight: '300',
    },
    'black-film': {
        bg: '#0D0D0D',
        text: '#EEEEEE',
        secondaryText: '#AAAAAA',
        accentText: '#777777',
        font: 'Arial, Helvetica, sans-serif',
        fontWeight: '300',
    },
    'light-leica': {
        bg: '#F8F4EF',
        text: '#1A1A1A',
        secondaryText: '#555555',
        accentText: '#888888',
        font: 'Georgia, Times New Roman, serif',
        fontWeight: '400',
    },
    'film-strip': {
        bg: '#111111',
        text: '#E8E0D0',
        secondaryText: '#B0A090',
        accentText: '#806050',
        font: 'Courier New, Courier, monospace',
        fontWeight: '400',
    },
};
function buildDisplayMetadata(exif, override) {
    const defaultShowFields = [
        'camera',
        'lens',
        'focalLength',
        'aperture',
        'shutterSpeed',
        'iso',
        'date',
    ];
    const showFields = override?.showFields ?? defaultShowFields;
    const merged = {
        camera: override?.camera ?? exif.camera,
        lens: override?.lens ?? exif.lens,
        focalLength: override?.focalLength ?? exif.focalLength,
        aperture: override?.aperture ?? exif.aperture,
        shutterSpeed: override?.shutterSpeed ?? exif.shutterSpeed,
        iso: (override?.iso ?? exif.iso) ? `ISO ${override?.iso ?? exif.iso}` : undefined,
        date: override?.date ?? exif.date,
        location: override?.location,
    };
    const result = {};
    for (const field of showFields) {
        if (merged[field]) {
            result[field] = merged[field];
        }
    }
    return result;
}
function calculatePadding(imageWidth, imageHeight, style, size) {
    const basePadding = PADDING_MAP[size];
    if (style === 'film-strip') {
        return {
            top: Math.round(basePadding * 0.6),
            right: Math.round(basePadding * 0.6),
            bottom: Math.round(basePadding * 2.8),
            left: Math.round(basePadding * 0.6),
        };
    }
    if (style === 'white-minimal' || style === 'light-leica') {
        return {
            top: Math.round(basePadding * 0.5),
            right: Math.round(basePadding * 0.5),
            bottom: Math.round(basePadding * 2.5),
            left: Math.round(basePadding * 0.5),
        };
    }
    return {
        top: Math.round(basePadding * 0.6),
        right: Math.round(basePadding * 0.6),
        bottom: Math.round(basePadding * 3.0),
        left: Math.round(basePadding * 0.6),
    };
}
function getBackgroundRgb(style) {
    const colors = {
        'white-minimal': { r: 255, g: 255, b: 255 },
        'black-film': { r: 13, g: 13, b: 13 },
        'light-leica': { r: 248, g: 244, b: 239 },
        'film-strip': { r: 17, g: 17, b: 17 },
    };
    return colors[style];
}
function generateFrameSvg(canvasWidth, canvasHeight, imageHeight, padding, style, metadata, cameraBrand) {
    const config = STYLE_CONFIG[style];
    const metadataAreaTop = padding.top + imageHeight;
    const metadataAreaHeight = canvasHeight - metadataAreaTop;
    const fontSize = Math.max(16, Math.min(28, Math.round(canvasWidth / 55)));
    const smallFontSize = Math.round(fontSize * 0.78);
    const lineHeight = Math.round(fontSize * 1.7);
    const startY = metadataAreaTop + Math.round(metadataAreaHeight * 0.28) + fontSize;
    let innerSvg = '';
    if (style === 'white-minimal') {
        innerSvg = minimalContent(canvasWidth, canvasHeight, padding, config, metadata, fontSize, smallFontSize, lineHeight, startY, imageHeight);
    }
    else if (style === 'black-film') {
        innerSvg = filmContent(canvasWidth, canvasHeight, padding, config, metadata, fontSize, smallFontSize, lineHeight, startY, cameraBrand);
    }
    else if (style === 'light-leica') {
        innerSvg = leicaContent(canvasWidth, canvasHeight, padding, config, metadata, fontSize, smallFontSize, lineHeight, startY, cameraBrand);
    }
    else if (style === 'film-strip') {
        innerSvg = filmStripContent(canvasWidth, canvasHeight, padding, config, metadata, fontSize, smallFontSize, lineHeight, startY, imageHeight);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n${innerSvg}\n</svg>`;
    return Buffer.from(svg);
}
function x(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function minimalContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight) {
    const lx = padding.left + 24;
    const rx = w - padding.right - 24;
    const imageBottom = padding.top + imageHeight;
    const camera = x(meta.camera ?? '');
    const lens = x(meta.lens ?? '');
    const specs = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso]
        .filter(Boolean).map(x).join('  ·  ');
    const date = x(meta.date ?? '');
    return `
  <!-- Thin separator line below image -->
  <line x1="${padding.left + 16}" y1="${imageBottom + Math.round(padding.bottom * 0.08)}"
    x2="${w - padding.right - 16}" y2="${imageBottom + Math.round(padding.bottom * 0.08)}"
    stroke="${config.accentText}" stroke-width="0.6" opacity="0.35"/>

  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="500" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}
`;
}
function filmContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand) {
    const lx = padding.left + 28;
    const rx = w - padding.right - 28;
    const cx = Math.round(w / 2);
    const camera = x(meta.camera ?? cameraBrand ?? '');
    const lens = x(meta.lens ?? '');
    const leftSpec = [meta.focalLength, meta.aperture].filter(Boolean).map(x).join('  ◆  ');
    const rightSpec = [meta.shutterSpeed, meta.iso].filter(Boolean).map(x).join('  ◆  ');
    const date = x(meta.date ?? '');
    return `
  ${camera ? `<text x="${cx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="300" letter-spacing="4" fill="${config.text}" text-anchor="middle">${camera.toUpperCase()}</text>` : ''}

  <line x1="${lx}" y1="${sy + Math.round(lh * 0.4)}" x2="${rx}" y2="${sy + Math.round(lh * 0.4)}"
    stroke="${config.accentText}" stroke-width="0.5"/>

  ${lens ? `<text x="${cx}" y="${sy + lh * 1.15}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="middle">${lens}</text>` : ''}
  ${leftSpec ? `<text x="${lx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="start">${leftSpec}</text>` : ''}
  ${date ? `<text x="${cx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="2" fill="${config.accentText}" text-anchor="middle">${date}</text>` : ''}
  ${rightSpec ? `<text x="${rx}" y="${sy + lh * 2.3}" font-family="${config.font}" font-size="${sfs}px" font-weight="300" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${rightSpec}</text>` : ''}
`;
}
function leicaContent(w, h, padding, config, meta, fs, sfs, lh, sy, cameraBrand) {
    const lx = padding.left + 28;
    const rx = w - padding.right - 28;
    const brandIsLeica = cameraBrand?.toLowerCase().includes('leica');
    const camera = x(meta.camera ?? '');
    const lens = x(meta.lens ?? '');
    const specs = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso]
        .filter(Boolean).map(x).join('   ');
    const date = x(meta.date ?? '');
    return `
  ${brandIsLeica ? `<circle cx="${rx}" cy="${sy - Math.round(fs * 0.35)}" r="${Math.round(fs * 0.42)}" fill="#CC0000"/>` : ''}
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="600" letter-spacing="1" fill="${config.text}" text-anchor="start">${camera}</text>` : ''}
  ${lens ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" font-style="italic" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  <line x1="${lx}" y1="${sy + lh * 1.6}" x2="${Math.round(w * 0.38)}" y2="${sy + lh * 1.6}"
    stroke="${config.secondaryText}" stroke-width="0.7" opacity="0.4"/>
  ${specs ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date ? `<text x="${rx}" y="${sy + lh * 2.15}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" font-style="italic" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}
`;
}
function filmStripContent(w, h, padding, config, meta, fs, sfs, lh, sy, imageHeight) {
    const lx = padding.left + 28;
    const rx = w - padding.right - 28;
    const ss = Math.round(Math.min(w, h) * 0.016);
    const sp = ss * 3.8;
    const gy = Math.round(padding.top * 0.22);
    let sprockets = '';
    for (let px = padding.left + sp; px < w - padding.right - ss; px += sp) {
        const ix = Math.round(px - ss / 2);
        const sh = Math.round(ss * 1.4);
        const topY = Math.round(gy - sh / 2);
        sprockets += `<rect x="${ix}" y="${topY}" width="${ss}" height="${sh}" rx="2" fill="${config.accentText}" opacity="0.7"/>`;
        const imageBottom = padding.top + imageHeight;
        const bottomStripCenter = imageBottom + Math.round(padding.bottom * 0.1);
        const btY = Math.round(bottomStripCenter - sh / 2);
        sprockets += `<rect x="${ix}" y="${btY}" width="${ss}" height="${sh}" rx="2" fill="${config.accentText}" opacity="0.7"/>`;
    }
    const camera = x(meta.camera ?? '');
    const lens = x(meta.lens ?? '');
    const specs = [meta.focalLength, meta.aperture, meta.shutterSpeed, meta.iso].filter(Boolean).map(x).join('  ');
    const date = x(meta.date ?? '');
    const frameNum = String(Math.floor(Math.random() * 36) + 1).padStart(2, '0');
    return `
  ${sprockets}

  <text x="${lx}" y="${sy - Math.round(lh * 0.4)}" font-family="${config.font}" font-size="${Math.round(fs * 0.65)}px" font-weight="400" fill="${config.accentText}" text-anchor="start">${frameNum}</text>
  ${camera ? `<text x="${lx}" y="${sy}" font-family="${config.font}" font-size="${fs}px" font-weight="400" letter-spacing="2" fill="${config.text}" text-anchor="start">${camera.toUpperCase()}</text>` : ''}
  ${lens ? `<text x="${lx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.secondaryText}" text-anchor="start">${lens}</text>` : ''}
  ${specs ? `<text x="${rx}" y="${sy}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" letter-spacing="1" fill="${config.secondaryText}" text-anchor="end">${specs}</text>` : ''}
  ${date ? `<text x="${rx}" y="${sy + lh}" font-family="${config.font}" font-size="${sfs}px" font-weight="400" fill="${config.accentText}" text-anchor="end">${date}</text>` : ''}
`;
}
//# sourceMappingURL=frame-renderer.util.js.map