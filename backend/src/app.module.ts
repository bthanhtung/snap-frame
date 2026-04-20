import { Module } from '@nestjs/common';
import { FrameModule } from './frame/frame.module.js';
import { BatchModule } from './batch/batch.module.js';

@Module({
  imports: [FrameModule, BatchModule],
})
export class AppModule {}
