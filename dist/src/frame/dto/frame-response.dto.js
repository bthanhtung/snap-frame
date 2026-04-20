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
exports.FrameTemplateDto = exports.ProcessResponseDto = exports.ExifDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ExifDataDto {
    camera;
    cameraBrand;
    lens;
    focalLength;
    aperture;
    shutterSpeed;
    iso;
    date;
    gps;
    imageWidth;
    imageHeight;
    orientation;
}
exports.ExifDataDto = ExifDataDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sony ILCE-7CM2' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "camera", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sony' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "cameraBrand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FE 35mm F1.8' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "lens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '35mm' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "focalLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'f/1.8' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "aperture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1/500' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "shutterSpeed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '800' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "iso", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-12-25T10:30:00' }),
    __metadata("design:type", String)
], ExifDataDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { lat: 21.028, lng: 105.834 } }),
    __metadata("design:type", Object)
], ExifDataDto.prototype, "gps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 6000 }),
    __metadata("design:type", Number)
], ExifDataDto.prototype, "imageWidth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4000 }),
    __metadata("design:type", Number)
], ExifDataDto.prototype, "imageHeight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    __metadata("design:type", Number)
], ExifDataDto.prototype, "orientation", void 0);
class ProcessResponseDto {
    size;
    width;
    height;
    mimeType;
}
exports.ProcessResponseDto = ProcessResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kích thước ảnh output (bytes)' }),
    __metadata("design:type", Number)
], ProcessResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chiều rộng ảnh output (px)' }),
    __metadata("design:type", Number)
], ProcessResponseDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chiều cao ảnh output (px)' }),
    __metadata("design:type", Number)
], ProcessResponseDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type ảnh output', example: 'image/jpeg' }),
    __metadata("design:type", String)
], ProcessResponseDto.prototype, "mimeType", void 0);
class FrameTemplateDto {
    id;
    name;
    description;
    backgroundColor;
    textColor;
    fontStyle;
}
exports.FrameTemplateDto = FrameTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'white-minimal' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'White Minimal' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Frame trắng tối giản, chữ đen nhỏ góc dưới' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#FFFFFF' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#000000' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "textColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sans-serif' }),
    __metadata("design:type", String)
], FrameTemplateDto.prototype, "fontStyle", void 0);
//# sourceMappingURL=frame-response.dto.js.map