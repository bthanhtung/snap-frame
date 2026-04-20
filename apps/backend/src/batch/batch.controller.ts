import {
  Controller, Post, Body, UploadedFiles,
  UseInterceptors, BadRequestException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BatchService } from './batch.service.js';
import { FrameOptionsDto } from '../frame/dto/frame-options.dto.js';
import { plainToInstance } from 'class-transformer';

@ApiTags('batch')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  /**
   * POST /api/batch/process
   * Upload up to 10 images, process with same options, return base64 array
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch process images',
    description: 'Upload nhiều ảnh, xử lý với cùng options. Trả về mảng base64 (tối đa 10 ảnh).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        options: { type: 'string', description: 'JSON FrameOptionsDto' },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 200, description: 'Array of processed image results' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async batchProcess(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('options') optionsString: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files per batch.');
    }

    let options: FrameOptionsDto = {};
    if (optionsString) {
      try {
        options = plainToInstance(FrameOptionsDto, JSON.parse(optionsString));
      } catch {
        throw new BadRequestException('Invalid JSON in options.');
      }
    }

    const results = await this.batchService.processImages(files, options);
    return {
      total: files.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}
