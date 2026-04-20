import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module.js';
import serverlessHttp from 'serverless-http';

let cachedApp: any;

async function createApp() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Image Frame API')
    .setDescription('Upload ảnh, đọc EXIF, resize và thêm frame với thông số camera.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.init();

  cachedApp = serverlessHttp(app.getHttpAdapter().getInstance());
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}
