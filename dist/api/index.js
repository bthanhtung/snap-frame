"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_js_1 = require("../src/app.module.js");
const serverless_http_1 = __importDefault(require("serverless-http"));
let cachedApp;
async function createApp() {
    if (cachedApp)
        return cachedApp;
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule, {
        logger: ['error', 'warn'],
    });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Image Frame API')
        .setDescription('Upload ảnh, đọc EXIF, resize và thêm frame với thông số camera.')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.init();
    cachedApp = (0, serverless_http_1.default)(app.getHttpAdapter().getInstance());
    return cachedApp;
}
async function handler(req, res) {
    const app = await createApp();
    return app(req, res);
}
//# sourceMappingURL=index.js.map