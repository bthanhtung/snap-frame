import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller.js';
import { BatchService } from './batch.service.js';
import { FrameModule } from '../frame/frame.module.js';

@Module({
  imports: [FrameModule],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
