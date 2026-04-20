export declare class ResizeOptionsDto {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
export declare class FrameStyleOptionsDto {
    enabled: boolean;
    style?: 'white-minimal' | 'black-film' | 'light-leica' | 'film-strip';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    position?: 'bottom' | 'all';
}
export declare class MetadataOverrideDto {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    date?: string;
    location?: string;
    showFields?: string[];
}
export declare class OutputOptionsDto {
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
}
export declare class FrameOptionsDto {
    resize?: ResizeOptionsDto;
    frame?: FrameStyleOptionsDto;
    metadata?: MetadataOverrideDto;
    output?: OutputOptionsDto;
}
