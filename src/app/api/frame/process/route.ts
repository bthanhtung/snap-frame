import { NextRequest, NextResponse } from 'next/server';
import {
  buildDisplayMetadata,
  calculatePadding,
  generateFrameSvg,
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
    const sharp = (await import('sharp')).default;

    // 1. Initial process: rotate and metadata
    let pipeline = sharp(buffer).rotate();
    const { width: imgW, height: imgH } = await pipeline.metadata();
    if (!imgW || !imgH) return NextResponse.json({ message: 'Bad dimensions' }, { status: 400 });

    const styleId: FrameStyle = options.frame?.style ?? 'white-minimal';
    const size: FrameSize     = options.frame?.size  ?? 'md';
    const design = options.design || {};
    const vPos = options.metadata?.vPosition || 'bottom';
    
    // 2. Custom Border & Corner Radius for the Image itself
    let processedImage = pipeline;
    const radius = design.cornerRadius || 0;
    
    if (radius > 0) {
      const mask = Buffer.from(
        `<svg><rect x="0" y="0" width="${imgW}" height="${imgH}" rx="${radius}" ry="${radius}" fill="white"/></svg>`
      );
      processedImage = processedImage.composite([{ input: mask, blend: 'dest-in' }]);
    }

    const imageBuffer = await processedImage.toBuffer();

    // 3. Dynamic Frame padding and background based on vPosition
    const padding = calculatePadding(imgW, imgH, styleId, size, vPos);
    const bgColor = design.bgColor || STYLE_CONFIG[styleId].bg;

    const canvasW = imgW + padding.left + padding.right;
    const canvasH = imgH + padding.top  + padding.bottom;

    // 4. Create the final canvas with background
    let finalPipeline = sharp({
      create: {
        width: canvasW,
        height: canvasH,
        channels: 4,
        background: bgColor
      }
    });

    // 5. Composite Image and Metadata SVG
    const displayMeta = buildDisplayMetadata({}, options.metadata || options);
    const svgBuffer   = generateFrameSvg(canvasW, canvasH, imgH, padding, styleId, displayMeta, design);

    let composites: any[] = [
      { input: imageBuffer, top: padding.top, left: padding.left }
    ];

    composites.push({ input: svgBuffer, top: 0, left: 0 });

    let outputBuffer = await finalPipeline.composite(composites).jpeg({ quality: 92 }).toBuffer();

    // 6. Watermark
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
