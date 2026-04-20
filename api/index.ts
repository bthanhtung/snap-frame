import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../backend/src/app.module.js';
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

  await app.init();

  cachedApp = serverlessHttp(app.getHttpAdapter().getInstance());
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (err: any) {
    console.error('Backend Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
