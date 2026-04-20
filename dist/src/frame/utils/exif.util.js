"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractExif = extractExif;
async function extractExif(buffer) {
    try {
        const exifr = await import('exifr');
        const raw = await exifr.default.parse(buffer, {
            tiff: true,
            exif: true,
            gps: true,
            icc: false,
            iptc: false,
            xmp: false,
            reviveValues: true,
            translateValues: false,
            mergeOutput: true,
        });
        if (!raw) {
            return {};
        }
        return {
            camera: buildCameraName(raw),
            cameraBrand: extractBrand(raw),
            lens: buildLensName(raw),
            focalLength: formatFocalLength(raw.FocalLength ?? raw.FocalLengthIn35mmFormat),
            aperture: formatAperture(raw.FNumber ?? raw.ApertureValue),
            shutterSpeed: formatShutterSpeed(raw.ExposureTime ?? raw.ShutterSpeedValue),
            iso: raw.ISO ? String(raw.ISO) : undefined,
            date: formatDate(raw.DateTimeOriginal ?? raw.DateTime ?? raw.CreateDate),
            gps: formatGPS(raw),
            imageWidth: raw.ExifImageWidth ?? raw.ImageWidth ?? raw.PixelXDimension,
            imageHeight: raw.ExifImageHeight ?? raw.ImageHeight ?? raw.PixelYDimension,
            orientation: raw.Orientation,
        };
    }
    catch (err) {
        console.warn('EXIF extraction failed:', err?.message);
        return {};
    }
}
function buildCameraName(raw) {
    const make = raw.Make?.trim();
    const model = raw.Model?.trim();
    if (!model)
        return undefined;
    if (make && !model.toLowerCase().startsWith(make.toLowerCase())) {
        return `${make} ${model}`;
    }
    return model;
}
function extractBrand(raw) {
    const make = raw.Make?.trim();
    if (!make)
        return undefined;
    const brands = {
        SONY: 'Sony',
        CANON: 'Canon',
        NIKON: 'Nikon',
        FUJIFILM: 'Fujifilm',
        OLYMPUS: 'Olympus',
        PANASONIC: 'Panasonic',
        LEICA: 'Leica',
        HASSELBLAD: 'Hasselblad',
        'APPLE INC.': 'Apple',
        APPLE: 'Apple',
        SAMSUNG: 'Samsung',
        GOOGLE: 'Google',
        HUAWEI: 'Huawei',
        XIAOMI: 'Xiaomi',
    };
    return brands[make.toUpperCase()] ?? make;
}
function buildLensName(raw) {
    return (raw.LensModel?.trim() ??
        raw.Lens?.trim() ??
        raw.LensInfo?.trim() ??
        undefined);
}
function formatFocalLength(value) {
    if (value == null)
        return undefined;
    return `${Math.round(value)}mm`;
}
function formatAperture(value) {
    if (value == null)
        return undefined;
    const f = Math.round(value * 10) / 10;
    return `f/${f}`;
}
function formatShutterSpeed(value) {
    if (value == null)
        return undefined;
    if (value >= 1) {
        return `${Math.round(value)}s`;
    }
    const denominator = Math.round(1 / value);
    return `1/${denominator}s`;
}
function formatDate(value) {
    if (!value)
        return undefined;
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime()))
            return undefined;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}.${mm}.${dd}`;
    }
    catch {
        return undefined;
    }
}
function formatGPS(raw) {
    if (raw.latitude != null && raw.longitude != null) {
        return {
            lat: Math.round(raw.latitude * 10000) / 10000,
            lng: Math.round(raw.longitude * 10000) / 10000,
        };
    }
    return undefined;
}
//# sourceMappingURL=exif.util.js.map