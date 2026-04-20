import sharp from 'sharp';

export interface WatermarkOptions {
  imageBase64: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;  // 0.0 – 1.0
  scale?: number;    // fraction of image width, e.g. 0.15 = 15%
}

/**
 * Composite a watermark logo onto an image buffer.
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  watermark: WatermarkOptions,
): Promise<Buffer> {
  const { imageBase64, position = 'bottom-right', opacity = 0.7, scale = 0.15 } = watermark;

  // Decode base64 logo
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const logoBuffer = Buffer.from(base64Data, 'base64');

  // Get image dimensions
  const { width: imgW = 800, height: imgH = 600 } = await sharp(imageBuffer).metadata();

  // Resize logo to scale% of image width
  const logoW = Math.max(40, Math.round(imgW * Math.min(scale, 0.4)));
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: logoW, fit: 'inside', withoutEnlargement: false })
    .ensureAlpha()
    .toBuffer();

  const { width: lw = logoW, height: lh = logoW } = await sharp(resizedLogo).metadata();

  // Calculate position with 24px margin
  const margin = Math.round(Math.min(imgW, imgH) * 0.03);
  const positions: Record<string, { top: number; left: number }> = {
    'top-left':     { top: margin,              left: margin },
    'top-right':    { top: margin,              left: imgW - lw - margin },
    'bottom-left':  { top: imgH - lh - margin, left: margin },
    'bottom-right': { top: imgH - lh - margin, left: imgW - lw - margin },
    'center':       { top: Math.round((imgH - lh) / 2), left: Math.round((imgW - lw) / 2) },
  };
  const { top, left } = positions[position] ?? positions['bottom-right'];

  // Apply opacity by modifying alpha channel
  const clampedOpacity = Math.max(0.05, Math.min(1.0, opacity));
  const logoWithOpacity = await sharp(resizedLogo)
    .composite([{
      input: Buffer.from([0, 0, 0, Math.round(255 * (1 - clampedOpacity))]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-out',
    }])
    .toBuffer()
    .catch(() => resizedLogo); // fallback if opacity trick fails

  return sharp(imageBuffer)
    .composite([{ input: logoWithOpacity, top: Math.max(0, top), left: Math.max(0, left) }])
    .toBuffer();
}
