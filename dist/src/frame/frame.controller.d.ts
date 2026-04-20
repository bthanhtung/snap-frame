import type { Response } from 'express';
import { FrameService } from './frame.service.js';
import { ExifDataDto, FrameTemplateDto } from './dto/frame-response.dto.js';
export declare class FrameController {
    private readonly frameService;
    constructor(frameService: FrameService);
    processImage(file: Express.Multer.File, optionsString: string, res: Response): Promise<void>;
    extractExif(file: Express.Multer.File): Promise<ExifDataDto>;
    getTemplates(): FrameTemplateDto[];
}
