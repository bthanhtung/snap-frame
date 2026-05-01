export interface ExifDataDto {
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
