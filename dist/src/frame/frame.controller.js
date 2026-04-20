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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const frame_service_js_1 = require("./frame.service.js");
const frame_options_dto_js_1 = require("./dto/frame-options.dto.js");
const frame_response_dto_js_1 = require("./dto/frame-response.dto.js");
const class_transformer_1 = require("class-transformer");
const MAX_FILE_SIZE = 20 * 1024 * 1024;
let FrameController = class FrameController {
    frameService;
    constructor(frameService) {
        this.frameService = frameService;
    }
    async processImage(file, optionsString, res) {
        let options = {};
        if (optionsString) {
            try {
                const parsed = JSON.parse(optionsString);
                options = (0, class_transformer_1.plainToInstance)(frame_options_dto_js_1.FrameOptionsDto, parsed);
            }
            catch {
                throw new common_1.BadRequestException('Invalid JSON in options field.');
            }
        }
        const result = await this.frameService.processImage(file.buffer, options);
        const mimeTypes = {
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
        };
        const mimeType = mimeTypes[result.format] ?? 'image/jpeg';
        const ext = result.format === 'jpeg' ? 'jpg' : result.format;
        res.set({
            'Content-Type': mimeType,
            'Content-Length': result.size,
            'Content-Disposition': `attachment; filename="framed_${Date.now()}.${ext}"`,
            'X-Image-Width': result.width,
            'X-Image-Height': result.height,
        });
        res.end(result.buffer);
    }
    async extractExif(file) {
        return this.frameService.extractExifFromBuffer(file.buffer);
    }
    getTemplates() {
        return this.frameService.getTemplates();
    }
};
exports.FrameController = FrameController;
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Process image with frame',
        description: 'Upload ảnh và tùy chọn frame/resize. Trả về ảnh đã xử lý dưới dạng binary stream (image/jpeg).',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh gốc (JPEG, PNG, WebP)',
                },
                options: {
                    type: 'string',
                    description: 'JSON string của FrameOptionsDto',
                    example: JSON.stringify({
                        resize: { width: 1080, fit: 'inside' },
                        frame: { enabled: true, style: 'white-minimal', size: 'md' },
                        output: { format: 'jpeg', quality: 90 },
                    }),
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ảnh đã xử lý — binary stream',
        content: { 'image/jpeg': {} },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request — invalid file or options' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: undefined,
        limits: { fileSize: MAX_FILE_SIZE },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
    }))),
    __param(1, (0, common_1.Body)('options')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FrameController.prototype, "processImage", null);
__decorate([
    (0, common_1.Post)('extract-exif'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Extract EXIF metadata',
        description: 'Upload ảnh và trả về EXIF metadata dưới dạng JSON — dùng để preview thông số trước khi process.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh gốc (JPEG, PNG)',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'EXIF metadata JSON',
        type: frame_response_dto_js_1.ExifDataDto,
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: MAX_FILE_SIZE },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FrameController.prototype, "extractExif", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get frame templates',
        description: 'Trả về danh sách các frame template có sẵn.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách frame templates',
        type: [frame_response_dto_js_1.FrameTemplateDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], FrameController.prototype, "getTemplates", null);
exports.FrameController = FrameController = __decorate([
    (0, swagger_1.ApiTags)('frame'),
    (0, common_1.Controller)('frame'),
    __metadata("design:paramtypes", [frame_service_js_1.FrameService])
], FrameController);
//# sourceMappingURL=frame.controller.js.map