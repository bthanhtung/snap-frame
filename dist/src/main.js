"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Image Frame API')
        .setDescription('API để upload ảnh, đọc EXIF metadata, resize và thêm frame với thông số camera — tương tự Cameramark/Liit.')
        .setVersion('1.0')
        .addTag('frame', 'Image Frame Processing')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Image Frame API Docs',
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Image Frame API is running on: http://localhost:${port}`);
    console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map