import { Module } from '@nestjs/common';
import { FrameController } from './frame.controller.js';
import { FrameService } from './frame.service.js';

@Module({
  controllers: [FrameController],
  providers: [FrameService],
  exports: [FrameService],
})
export class FrameModule {}
