import { Module } from '@nestjs/common';
import { DeveloperController } from './developers.controller';
import { DeveloperService } from './developers.service';

@Module({
  controllers: [DeveloperController],
  providers: [DeveloperService],
  imports: [],
})
export class DeveloperModule {}
