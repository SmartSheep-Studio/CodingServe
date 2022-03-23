import { Module } from '@nestjs/common';
import { StateController } from './state/state.controller';
import { AuthorizationModule } from './authorization/authorization.module';
import { UsersModule } from './authorization/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { IndexController } from './index.controller';

@Module({
  imports: [AuthorizationModule, UsersModule, PrismaModule],
  controllers: [StateController, IndexController],
  providers: [],
})
export class AppModule {
}
