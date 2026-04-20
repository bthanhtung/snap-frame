import { Injectable } from '@nestjs/common';
import { FrameService } from '../frame/frame.service.js';
import { FrameOptionsDto } from '../frame/dto/frame-options.dto.js';

export interface BatchItemResult {
  index: number;
  originalName: string;
  success: boolean;
  base64?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  size?: number;
  error?: string;
}

@Injectable()
export class BatchService {
  constructor(private readonly frameService: FrameService) {}

  /**
   * Process multiple images sequentially with the same options.
   * Returns base64-encoded results to avoid ZIP complexity on Vercel.
   */
  async processImages(
    files: Express.Multer.File[],
    options: FrameOptionsDto,
  ): Promise<BatchItemResult[]> {
    const results: BatchItemResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.frameService.processImage(file.buffer, options);
        results.push({
          index: i,
          originalName: file.originalname,
          success: true,
          base64: result.buffer.toString('base64'),
          mimeType: `image/${result.format}`,
          width: result.width,
          height: result.height,
          size: result.size,
        });
      } catch (err: any) {
        results.push({
          index: i,
          originalName: file.originalname,
          success: false,
          error: err?.message ?? 'Processing failed',
        });
      }
    }

    return results;
  }
}
