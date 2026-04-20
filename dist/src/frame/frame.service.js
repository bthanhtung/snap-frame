"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
const exif_util_js_1 = require("./utils/exif.util.js");
const frame_renderer_util_js_1 = require("./utils/frame-renderer.util.js");
let FrameService = class FrameService {
    async extractExifFromBuffer(buffer) {
        return (0, exif_util_js_1.extractExif)(buffer);
    }
    async processImage(buffer, options) {
        this.validateBuffer(buffer);
        const exif = await (0, exif_util_js_1.extractExif)(buffer);
        let pipeline = (0, sharp_1.default)(buffer).rotate();
        const resize = options.resize;
        if (resize?.width || resize?.height) {
            pipeline = pipeline.resize({
                width: resize.width,
                height: resize.height,
                fit: resize.fit ?? 'inside',
                withoutEnlargement: true,
            });
        }
        const resizedBuffer = await pipeline.toBuffer();
        const { width: imgW, height: imgH } = await (0, sharp_1.default)(resizedBuffer).metadata();
        if (!imgW || !imgH) {
            throw new common_1.BadRequestException('Cannot determine image dimensions after resize.');
        }
        const frameEnabled = options.frame?.enabled !== false;
        if (!frameEnabled) {
            const fmt = options.output?.format ?? 'jpeg';
            const q = options.output?.quality ?? 90;
            const out = await this.toFormat((0, sharp_1.default)(resizedBuffer), fmt, q);
            return { buffer: out, width: imgW, height: imgH, format: fmt, size: out.length };
        }
        const style = options.frame?.style ?? 'white-minimal';
        const size = options.frame?.size ?? 'md';
        const padding = (0, frame_renderer_util_js_1.calculatePadding)(imgW, imgH, style, size);
        const bgRgb = (0, frame_renderer_util_js_1.getBackgroundRgb)(style);
        const canvasW = imgW + padding.left + padding.right;
        const canvasH = imgH + padding.top + padding.bottom;
        const extendedBuffer = await (0, sharp_1.default)(resizedBuffer)
            .extend({
            top: padding.top,
            bottom: padding.bottom,
            left: padding.left,
            right: padding.right,
            background: bgRgb,
        })
            .toBuffer();
        const displayMeta = (0, frame_renderer_util_js_1.buildDisplayMetadata)(exif, options.metadata);
        const svgBuffer = (0, frame_renderer_util_js_1.generateFrameSvg)(canvasW, canvasH, imgH, padding, style, displayMeta, exif.cameraBrand);
        const fmt = options.output?.format ?? 'jpeg';
        const q = options.output?.quality ?? 90;
        const compositedBuffer = await (0, sharp_1.default)(extendedBuffer)
            .composite([{ input: svgBuffer, top: 0, left: 0 }])
            .toBuffer();
        const outputBuffer = await this.toFormat((0, sharp_1.default)(compositedBuffer), fmt, q);
        return {
            buffer: outputBuffer,
            width: canvasW,
            height: canvasH,
            format: fmt,
            size: outputBuffer.length,
        };
    }
    validateBuffer(buffer) {
        if (!buffer || buffer.length === 0) {
            throw new common_1.BadRequestException('Invalid or empty image buffer.');
        }
        if (buffer.length > 20 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large. Maximum 20MB.');
        }
    }
    async toFormat(pipeline, format, quality) {
        switch (format) {
            case 'png': return pipeline.png({ compressionLevel: 6 }).toBuffer();
            case 'webp': return pipeline.webp({ quality }).toBuffer();
            default: return pipeline.jpeg({ quality, mozjpeg: false }).toBuffer();
        }
    }
    getTemplates() {
        return [
            {
                id: 'white-minimal',
                name: 'White Minimal',
                description: 'Nền trắng tối giản, chữ đen. Phong cách hiện đại, sạch sẽ.',
                backgroundColor: '#FFFFFF',
                textColor: '#1A1A1A',
                fontStyle: 'sans-serif',
                preview: null,
            },
            {
                id: 'black-film',
                name: 'Black Film',
                description: 'Nền đen, chữ trắng. Phong cách điện ảnh, sang trọng.',
                backgroundColor: '#0D0D0D',
                textColor: '#EEEEEE',
                fontStyle: 'sans-serif',
                preview: null,
            },
            {
                id: 'light-leica',
                name: 'Light Leica',
                description: 'Nền kem nhẹ, font serif, chấm đỏ đặc trưng (máy Leica).',
                backgroundColor: '#F8F4EF',
                textColor: '#1A1A1A',
                fontStyle: 'serif',
                preview: null,
            },
            {
                id: 'film-strip',
                name: 'Film Strip',
                description: 'Nền đen với lỗ cuộn film, font monospace, phong cách analog.',
                backgroundColor: '#111111',
                textColor: '#E8E0D0',
                fontStyle: 'monospace',
                preview: null,
            },
        ];
    }
};
exports.FrameService = FrameService;
exports.FrameService = FrameService = __decorate([
    (0, common_1.Injectable)()
], FrameService);
//# sourceMappingURL=frame.service.js.map