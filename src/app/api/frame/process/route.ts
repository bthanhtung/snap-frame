import { NextRequest, NextResponse } from 'next/server';
import {
  buildDisplayMetadata,
  calculatePadding,
  generateFrameSvg,
  getBackgroundRgb,
  STYLE_CONFIG,
  FrameStyle,
  FrameSize,
} from '@/lib/frame-logic/frame-renderer.util';
import { applyWatermark } from '@/lib/frame-logic/watermark.util';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const options = JSON.parse(formData.get('options') as string || '{}');
    if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Server-side EXIF extraction is now a backup/fallback
    let exif = {};
    try {
      const exifr = (await import('exifr')).default;
      exif = await exifr.parse(buffer, { tiff: true, exif: true, mergeOutput: true }) || {};
    } catch (e) {
      console.warn('Server EXIF fallback failed (likely compressed image)');
    }

    const sharp = (await import('sharp')).default;
    let pipeline = sharp(buffer).rotate();
    const resizedBuffer = await pipeline.toBuffer();
    const { width: imgW, height: imgH } = await sharp(resizedBuffer).metadata();
    if (!imgW || !imgH) return NextResponse.json({ message: 'Bad dimensions' }, { status: 400 });

    const style: FrameStyle = options.frame?.style ?? 'white-minimal';
    const size: FrameSize   = options.frame?.size  ?? 'md';
    const padding = calculatePadding(imgW, imgH, style, size);
    const bgRgb   = getBackgroundRgb(style);

    const canvasW = imgW + padding.left + padding.right;
    const canvasH = imgH + padding.top  + padding.bottom;

    const extendedBuffer = await sharp(resizedBuffer)
      .extend({ top: padding.top, bottom: padding.bottom, left: padding.left, right: padding.right, background: bgRgb })
      .toBuffer();

    // PRIORITIZE client-sent metadata (which includes overrides)
    const displayMeta = buildDisplayMetadata(exif, options.metadata || options);
    const svgBuffer   = generateFrameSvg(canvasW, canvasH, imgH, padding, style, displayMeta, options.metadata?.cameraBrand);

    const compositedBuffer = await sharp(extendedBuffer)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .toBuffer();

    let outputBuffer = await sharp(compositedBuffer).jpeg({ quality: 90 }).toBuffer();

    if (options.watermark?.imageBase64) {
      outputBuffer = await applyWatermark(outputBuffer, options.watermark);
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: { 'Content-Type': 'image/jpeg' }
    });
  } catch (err: any) {
    console.error('Process error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
