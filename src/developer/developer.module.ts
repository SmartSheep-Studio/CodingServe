import { Module } from '@nestjs/common';
import { DeveloperController } from './developer.controller';
import { DeveloperApiController } from './developer.api.controller';
import { DeveloperService } from './developer.service';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  controllers: [DeveloperController, DeveloperApiController],
  providers: [DeveloperService],
  imports: [AuthorizationModule]
})
export class DeveloperModule {}
