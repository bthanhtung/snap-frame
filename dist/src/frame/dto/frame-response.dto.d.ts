export declare class ExifDataDto {
    camera?: string;
    cameraBrand?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    date?: string;
    gps?: {
        lat: number;
        lng: number;
    };
    imageWidth?: number;
    imageHeight?: number;
    orientation?: number;
}
export declare class ProcessResponseDto {
    size: number;
    width: number;
    height: number;
    mimeType: string;
}
export declare class FrameTemplateDto {
    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    textColor: string;
    fontStyle: string;
}
