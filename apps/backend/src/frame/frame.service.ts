import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { FrameOptionsDto } from './dto/frame-options.dto.js';
import { ExifDataDto } from './dto/frame-response.dto.js';
import { extractExif } from './utils/exif.util.js';
import {
  buildDisplayMetadata,
  calculatePadding,
  generateFrameSvg,
  getBackgroundRgb,
  STYLE_CONFIG,
  FrameStyle,
  FrameSize,
} from './utils/frame-renderer.util.js';
import { applyWatermark } from './utils/watermark.util.js';

export interface ProcessResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

@Injectable()
export class FrameService {
  async extractExifFromBuffer(buffer: Buffer): Promise<ExifDataDto> {
    return extractExif(buffer);
  }

  async processImage(buffer: Buffer, options: FrameOptionsDto): Promise<ProcessResult> {
    this.validateBuffer(buffer);

    const exif = await extractExif(buffer);

    // Resize (auto-rotate from EXIF orientation)
    let pipeline = sharp(buffer).rotate();
    const resize = options.resize;
    if (resize?.width || resize?.height) {
      pipeline = pipeline.resize({
        width: resize.width,
        height: resize.height,
        fit: resize.fit ?? 'inside',
        withoutEnlargement: true,
      });
    }

    const resizedBuffer = await pipeline.toBuffer();
    const { width: imgW, height: imgH } = await sharp(resizedBuffer).metadata();
    if (!imgW || !imgH) throw new BadRequestException('Cannot determine image dimensions.');

    const fmt = options.output?.format ?? 'jpeg';
    const q   = options.output?.quality ?? 90;

    // No frame — just output (+ optional watermark)
    const frameEnabled = options.frame?.enabled !== false;
    if (!frameEnabled) {
      let out = await this.toFormat(sharp(resizedBuffer), fmt, q);
      if (options.watermark?.imageBase64) {
        out = await applyWatermark(out, options.watermark);
      }
      return { buffer: out, width: imgW, height: imgH, format: fmt, size: out.length };
    }

    // Frame pipeline
    const style: FrameStyle = options.frame?.style ?? 'white-minimal';
    const size: FrameSize   = options.frame?.size  ?? 'md';
    const padding = calculatePadding(imgW, imgH, style, size);
    const bgRgb   = getBackgroundRgb(style);

    const canvasW = imgW + padding.left + padding.right;
    const canvasH = imgH + padding.top  + padding.bottom;

    // Extend image with colored border
    const extendedBuffer = await sharp(resizedBuffer)
      .extend({ top: padding.top, bottom: padding.bottom, left: padding.left, right: padding.right, background: bgRgb })
      .toBuffer();

    // Generate SVG text overlay
    const displayMeta = buildDisplayMetadata(exif, options.metadata);
    const svgBuffer   = generateFrameSvg(canvasW, canvasH, imgH, padding, style, displayMeta, exif.cameraBrand);

    // Composite SVG on extended image
    const compositedBuffer = await sharp(extendedBuffer)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .toBuffer();

    // Output format
    let outputBuffer = await this.toFormat(sharp(compositedBuffer), fmt, q);

    // Optionally apply watermark last
    if (options.watermark?.imageBase64) {
      outputBuffer = await applyWatermark(outputBuffer, options.watermark);
    }

    return { buffer: outputBuffer, width: canvasW, height: canvasH, format: fmt, size: outputBuffer.length };
  }

  private validateBuffer(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) throw new BadRequestException('Empty image buffer.');
    if (buffer.length > 20 * 1024 * 1024) throw new BadRequestException('File too large. Max 20MB.');
  }

  private async toFormat(pipeline: sharp.Sharp, format: string, quality: number): Promise<Buffer> {
    switch (format) {
      case 'png':  return pipeline.png({ compressionLevel: 6 }).toBuffer();
      case 'webp': return pipeline.webp({ quality }).toBuffer();
      default:     return pipeline.jpeg({ quality }).toBuffer();
    }
  }

  getTemplates() {
    const styles: Array<{ id: FrameStyle; name: string; description: string }> = [
      { id: 'white-minimal', name: 'White Minimal',  description: 'Nền trắng tối giản, chữ đen. Phong cách hiện đại, sạch sẽ.' },
      { id: 'black-film',    name: 'Black Film',     description: 'Nền đen, chữ trắng, centered uppercase. Phong cách điện ảnh.' },
      { id: 'light-leica',   name: 'Light Leica',    description: 'Nền kem, font serif, chấm đỏ Leica. Sang trọng cổ điển.' },
      { id: 'film-strip',    name: 'Film Strip',     description: 'Nền đen với lỗ cuộn film, monospace. Phong cách analog.' },
      { id: 'polaroid',      name: 'Polaroid',       description: 'Viền trắng dày dưới, font serif nghiêng. Vintage tức thì.' },
      { id: 'instax',        name: 'Instax Mini',    description: 'Viền trắng kem, accent cam. Dễ thương, tươi trẻ.' },
      { id: 'kodachrome',    name: 'Kodachrome',     description: 'Nền kem vàng ấm, text nâu vàng. Vintage Kodak 35mm.' },
      { id: 'darkroom',      name: 'Darkroom',       description: 'Nền đen sâu, accent đỏ thẫm. Cinemagraph darkroom.' },
      { id: 'fujifilm',      name: 'Fujifilm Green', description: 'Nền trắng tinh, accent xanh Fuji. Minimalist Nhật Bản.' },
    ];
    return styles.map(s => ({
      ...s,
      backgroundColor: STYLE_CONFIG[s.id].bg,
      textColor:       STYLE_CONFIG[s.id].text,
      accentColor:     STYLE_CONFIG[s.id].accent ?? STYLE_CONFIG[s.id].accentText,
      fontStyle:       STYLE_CONFIG[s.id].font.includes('serif') ? 'serif'
                     : STYLE_CONFIG[s.id].font.includes('mono')  ? 'monospace' : 'sans-serif',
      preview: null,
    }));
  }
}
