import { Module } from '@nestjs/common';
import { DeveloperController } from '../controllers/developers.controller';
import { DeveloperService } from '../services/developers.service';

@Module({
  controllers: [DeveloperController],
  providers: [DeveloperService],
  imports: [],
})
export class DeveloperModule {}
