import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { FrameService } from './frame.service.js';
import { FrameOptionsDto } from './dto/frame-options.dto.js';
import { ExifDataDto, FrameTemplateDto } from './dto/frame-response.dto.js';
import { plainToInstance } from 'class-transformer';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (local dev); Vercel will enforce 4.5MB separately

@ApiTags('frame')
@Controller('frame')
export class FrameController {
  constructor(private readonly frameService: FrameService) {}

  /**
   * POST /api/frame/process
   * Upload image + options → returns processed image as binary stream
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process image with frame',
    description:
      'Upload ảnh và tùy chọn frame/resize. Trả về ảnh đã xử lý dưới dạng binary stream (image/jpeg).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh gốc (JPEG, PNG, WebP)',
        },
        options: {
          type: 'string',
          description: 'JSON string của FrameOptionsDto',
          example: JSON.stringify({
            resize: { width: 1080, fit: 'inside' },
            frame: { enabled: true, style: 'white-minimal', size: 'md' },
            output: { format: 'jpeg', quality: 90 },
          }),
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ảnh đã xử lý — binary stream',
    content: { 'image/jpeg': {} },
  })
  @ApiResponse({ status: 400, description: 'Bad request — invalid file or options' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // MemoryStorage by default (perfect for Vercel)
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async processImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('options') optionsString: string,
    @Res() res: Response,
  ): Promise<void> {
    let options: FrameOptionsDto = {};

    if (optionsString) {
      try {
        const parsed = JSON.parse(optionsString);
        options = plainToInstance(FrameOptionsDto, parsed);
      } catch {
        throw new BadRequestException('Invalid JSON in options field.');
      }
    }

    const result = await this.frameService.processImage(file.buffer, options);

    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const mimeType = mimeTypes[result.format] ?? 'image/jpeg';
    const ext = result.format === 'jpeg' ? 'jpg' : result.format;

    res.set({
      'Content-Type': mimeType,
      'Content-Length': result.size,
      'Content-Disposition': `attachment; filename="framed_${Date.now()}.${ext}"`,
      'X-Image-Width': result.width,
      'X-Image-Height': result.height,
    });

    res.end(result.buffer);
  }

  /**
   * POST /api/frame/extract-exif
   * Upload image → returns EXIF metadata JSON
   */
  @Post('extract-exif')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract EXIF metadata',
    description:
      'Upload ảnh và trả về EXIF metadata dưới dạng JSON — dùng để preview thông số trước khi process.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh gốc (JPEG, PNG)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'EXIF metadata JSON',
    type: ExifDataDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async extractExif(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<ExifDataDto> {
    return this.frameService.extractExifFromBuffer(file.buffer);
  }

  /**
   * GET /api/frame/templates
   * Returns available frame templates
   */
  @Get('templates')
  @ApiOperation({
    summary: 'Get frame templates',
    description: 'Trả về danh sách các frame template có sẵn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách frame templates',
    type: [FrameTemplateDto],
  })
  getTemplates(): FrameTemplateDto[] {
    return this.frameService.getTemplates();
  }
}
