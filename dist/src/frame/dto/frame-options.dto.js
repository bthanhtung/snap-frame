"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameOptionsDto = exports.OutputOptionsDto = exports.MetadataOverrideDto = exports.FrameStyleOptionsDto = exports.ResizeOptionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ResizeOptionsDto {
    width;
    height;
    fit;
}
exports.ResizeOptionsDto = ResizeOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chiều rộng output (px)', example: 1080 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(8000),
    __metadata("design:type", Number)
], ResizeOptionsDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chiều cao output (px)', example: 1080 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(8000),
    __metadata("design:type", Number)
], ResizeOptionsDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kiểu fit khi resize',
        enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
        default: 'inside',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['cover', 'contain', 'fill', 'inside', 'outside']),
    __metadata("design:type", String)
], ResizeOptionsDto.prototype, "fit", void 0);
class FrameStyleOptionsDto {
    enabled = true;
    style;
    size;
    position;
}
exports.FrameStyleOptionsDto = FrameStyleOptionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bật/tắt frame', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FrameStyleOptionsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Style frame',
        enum: ['white-minimal', 'black-film', 'light-leica', 'film-strip'],
        default: 'white-minimal',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['white-minimal', 'black-film', 'light-leica', 'film-strip']),
    __metadata("design:type", String)
], FrameStyleOptionsDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kích thước padding frame',
        enum: ['sm', 'md', 'lg', 'xl'],
        default: 'md',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sm', 'md', 'lg', 'xl']),
    __metadata("design:type", String)
], FrameStyleOptionsDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vị trí hiển thị metadata',
        enum: ['bottom', 'all'],
        default: 'bottom',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['bottom', 'all']),
    __metadata("design:type", String)
], FrameStyleOptionsDto.prototype, "position", void 0);
class MetadataOverrideDto {
    camera;
    lens;
    focalLength;
    aperture;
    shutterSpeed;
    iso;
    date;
    location;
    showFields;
}
exports.MetadataOverrideDto = MetadataOverrideDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sony A7C II' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "camera", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FE 35mm F1.8' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "lens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '35mm' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "focalLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'f/1.8' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "aperture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1/500s' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "shutterSpeed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '800' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "iso", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024.12.25' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hà Nội, Việt Nam' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MetadataOverrideDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Chọn fields nào hiển thị trên frame',
        example: ['camera', 'lens', 'aperture', 'shutterSpeed', 'iso', 'date'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MetadataOverrideDto.prototype, "showFields", void 0);
class OutputOptionsDto {
    format;
    quality;
}
exports.OutputOptionsDto = OutputOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Định dạng output',
        enum: ['jpeg', 'png', 'webp'],
        default: 'jpeg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['jpeg', 'png', 'webp']),
    __metadata("design:type", String)
], OutputOptionsDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Chất lượng ảnh output (1-100)',
        default: 90,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], OutputOptionsDto.prototype, "quality", void 0);
class FrameOptionsDto {
    resize;
    frame;
    metadata;
    output;
}
exports.FrameOptionsDto = FrameOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ResizeOptionsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ResizeOptionsDto),
    __metadata("design:type", ResizeOptionsDto)
], FrameOptionsDto.prototype, "resize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: FrameStyleOptionsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrameStyleOptionsDto),
    __metadata("design:type", FrameStyleOptionsDto)
], FrameOptionsDto.prototype, "frame", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: MetadataOverrideDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetadataOverrideDto),
    __metadata("design:type", MetadataOverrideDto)
], FrameOptionsDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: OutputOptionsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => OutputOptionsDto),
    __metadata("design:type", OutputOptionsDto)
], FrameOptionsDto.prototype, "output", void 0);
//# sourceMappingURL=frame-options.dto.js.map