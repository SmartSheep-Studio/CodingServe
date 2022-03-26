import { Module } from '@nestjs/common';
import { DeveloperController } from './developer.controller';
import { DeveloperService } from './developer.service';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  controllers: [DeveloperController],
  providers: [DeveloperService],
  imports: [AuthorizationModule]
})
export class DeveloperModule {}
