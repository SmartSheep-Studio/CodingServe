import { Module } from '@nestjs/common';
import { StateController } from './state/state.controller';
import { AuthorizationModule } from './authorization/authorization.module';
import { UsersModule } from './authorization/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthorizationModule, UsersModule, PrismaModule],
  controllers: [StateController],
  providers: [],
})
export class AppModule {
}
