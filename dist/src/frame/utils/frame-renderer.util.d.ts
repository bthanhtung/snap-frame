import { ExifDataDto } from '../dto/frame-response.dto.js';
import { MetadataOverrideDto } from '../dto/frame-options.dto.js';
export type FrameStyle = 'white-minimal' | 'black-film' | 'light-leica' | 'film-strip';
export type FrameSize = 'sm' | 'md' | 'lg' | 'xl';
export interface FramePadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export declare function buildDisplayMetadata(exif: ExifDataDto, override?: MetadataOverrideDto): Record<string, string>;
export declare function calculatePadding(imageWidth: number, imageHeight: number, style: FrameStyle, size: FrameSize): FramePadding;
export declare function getBackgroundRgb(style: FrameStyle): {
    r: number;
    g: number;
    b: number;
};
export declare function generateFrameSvg(canvasWidth: number, canvasHeight: number, imageHeight: number, padding: FramePadding, style: FrameStyle, metadata: Record<string, string>, cameraBrand?: string): Buffer;
