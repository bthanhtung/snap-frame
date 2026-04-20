import { FrameOptionsDto } from './dto/frame-options.dto.js';
import { ExifDataDto } from './dto/frame-response.dto.js';
export interface ProcessResult {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number;
}
export declare class FrameService {
    extractExifFromBuffer(buffer: Buffer): Promise<ExifDataDto>;
    processImage(buffer: Buffer, options: FrameOptionsDto): Promise<ProcessResult>;
    private validateBuffer;
    private toFormat;
    getTemplates(): {
        id: string;
        name: string;
        description: string;
        backgroundColor: string;
        textColor: string;
        fontStyle: string;
        preview: null;
    }[];
}
