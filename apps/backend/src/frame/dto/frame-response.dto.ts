import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExifDataDto {
  @ApiPropertyOptional({ example: 'Sony ILCE-7CM2' })
  camera?: string;

  @ApiPropertyOptional({ example: 'Sony' })
  cameraBrand?: string;

  @ApiPropertyOptional({ example: 'FE 35mm F1.8' })
  lens?: string;

  @ApiPropertyOptional({ example: '35mm' })
  focalLength?: string;

  @ApiPropertyOptional({ example: 'f/1.8' })
  aperture?: string;

  @ApiPropertyOptional({ example: '1/500' })
  shutterSpeed?: string;

  @ApiPropertyOptional({ example: '800' })
  iso?: string;

  @ApiPropertyOptional({ example: '2024-12-25T10:30:00' })
  date?: string;

  @ApiPropertyOptional({ example: { lat: 21.028, lng: 105.834 } })
  gps?: { lat: number; lng: number };

  @ApiPropertyOptional({ example: 6000 })
  imageWidth?: number;

  @ApiPropertyOptional({ example: 4000 })
  imageHeight?: number;

  @ApiPropertyOptional({ example: 1 })
  orientation?: number;
}

export class ProcessResponseDto {
  @ApiProperty({ description: 'Kích thước ảnh output (bytes)' })
  size: number;

  @ApiProperty({ description: 'Chiều rộng ảnh output (px)' })
  width: number;

  @ApiProperty({ description: 'Chiều cao ảnh output (px)' })
  height: number;

  @ApiProperty({ description: 'MIME type ảnh output', example: 'image/jpeg' })
  mimeType: string;
}

export class FrameTemplateDto {
  @ApiProperty({ example: 'white-minimal' })
  id: string;

  @ApiProperty({ example: 'White Minimal' })
  name: string;

  @ApiProperty({ example: 'Frame trắng tối giản, chữ đen nhỏ góc dưới' })
  description: string;

  @ApiProperty({ example: '#FFFFFF' })
  backgroundColor: string;

  @ApiProperty({ example: '#000000' })
  textColor: string;

  @ApiProperty({ example: 'sans-serif' })
  fontStyle: string;
}
