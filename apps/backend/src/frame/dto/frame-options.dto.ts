import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResizeOptionsDto {
  @ApiPropertyOptional({ description: 'Chiều rộng output (px)', example: 1080 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  width?: number;

  @ApiPropertyOptional({ description: 'Chiều cao output (px)', example: 1080 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  height?: number;

  @ApiPropertyOptional({
    description: 'Kiểu fit khi resize',
    enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
    default: 'inside',
  })
  @IsOptional()
  @IsEnum(['cover', 'contain', 'fill', 'inside', 'outside'])
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class FrameStyleOptionsDto {
  @ApiProperty({ description: 'Bật/tắt frame', example: true })
  @IsBoolean()
  enabled: boolean = true;

  @ApiPropertyOptional({
    description: 'Style frame',
    enum: ['white-minimal','black-film','light-leica','film-strip','polaroid','instax','kodachrome','darkroom','fujifilm'],
    default: 'white-minimal',
  })
  @IsOptional()
  @IsEnum(['white-minimal','black-film','light-leica','film-strip','polaroid','instax','kodachrome','darkroom','fujifilm'])
  style?: 'white-minimal'|'black-film'|'light-leica'|'film-strip'|'polaroid'|'instax'|'kodachrome'|'darkroom'|'fujifilm';

  @ApiPropertyOptional({ enum: ['sm','md','lg','xl'], default: 'md' })
  @IsOptional()
  @IsEnum(['sm','md','lg','xl'])
  size?: 'sm' | 'md' | 'lg' | 'xl';
}


export class MetadataOverrideDto {
  @ApiPropertyOptional({ example: 'Sony A7C II' })
  @IsOptional()
  @IsString()
  camera?: string;

  @ApiPropertyOptional({ example: 'FE 35mm F1.8' })
  @IsOptional()
  @IsString()
  lens?: string;

  @ApiPropertyOptional({ example: '35mm' })
  @IsOptional()
  @IsString()
  focalLength?: string;

  @ApiPropertyOptional({ example: 'f/1.8' })
  @IsOptional()
  @IsString()
  aperture?: string;

  @ApiPropertyOptional({ example: '1/500s' })
  @IsOptional()
  @IsString()
  shutterSpeed?: string;

  @ApiPropertyOptional({ example: '800' })
  @IsOptional()
  @IsString()
  iso?: string;

  @ApiPropertyOptional({ example: '2024.12.25' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'Hà Nội, Việt Nam' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Chọn fields nào hiển thị trên frame',
    example: ['camera', 'lens', 'aperture', 'shutterSpeed', 'iso', 'date'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  showFields?: string[];
}

export class OutputOptionsDto {
  @ApiPropertyOptional({
    description: 'Định dạng output',
    enum: ['jpeg', 'png', 'webp'],
    default: 'jpeg',
  })
  @IsOptional()
  @IsEnum(['jpeg', 'png', 'webp'])
  format?: 'jpeg' | 'png' | 'webp';

  @ApiPropertyOptional({
    description: 'Chất lượng ảnh output (1-100)',
    default: 90,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class WatermarkOptionsDto {
  @ApiProperty({ description: 'Logo image as base64 string (PNG/WebP)', example: 'data:image/png;base64,...' })
  @IsString()
  imageBase64: string;

  @ApiPropertyOptional({
    description: 'Watermark position',
    enum: ['top-left','top-right','bottom-left','bottom-right','center'],
    default: 'bottom-right',
  })
  @IsOptional()
  @IsEnum(['top-left','top-right','bottom-left','bottom-right','center'])
  position?: 'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center';

  @ApiPropertyOptional({ description: 'Opacity 0.0–1.0', default: 0.7, minimum: 0.05, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.05)
  @Max(1)
  opacity?: number;

  @ApiPropertyOptional({ description: 'Logo width as fraction of image width (0.05–0.4)', default: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0.05)
  @Max(0.4)
  scale?: number;
}

export class FrameOptionsDto {
  @ApiPropertyOptional({ type: ResizeOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResizeOptionsDto)
  resize?: ResizeOptionsDto;

  @ApiPropertyOptional({ type: FrameStyleOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FrameStyleOptionsDto)
  frame?: FrameStyleOptionsDto;

  @ApiPropertyOptional({ type: MetadataOverrideDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataOverrideDto)
  metadata?: MetadataOverrideDto;

  @ApiPropertyOptional({ type: OutputOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OutputOptionsDto)
  output?: OutputOptionsDto;

  @ApiPropertyOptional({ type: WatermarkOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WatermarkOptionsDto)
  watermark?: WatermarkOptionsDto;
}

