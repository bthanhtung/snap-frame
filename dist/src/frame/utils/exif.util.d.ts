import { ExifDataDto } from '../dto/frame-response.dto.js';
export declare function extractExif(buffer: Buffer): Promise<ExifDataDto>;
