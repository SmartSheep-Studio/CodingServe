import { Module } from '@nestjs/common';
import { StateController } from './state/state.controller';
import { AuthorizationModule } from './authorization/authorization.module';
import { UsersModule } from './authorization/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { IndexController } from './index.controller';
import { DeveloperModule } from './developer/developer.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [MailerModule.forRoot({
    transport: 'smtps://no-reply@smartsheep.space:5994816b782ad25faff83bc95b8d29a7@in-v3.mailjet.com:587',
    defaults: {
      from: '"SmartSheep No-Reply" <no-reply@smartsheep.space>',
    },
    template: {
      dir: __dirname + '/mails',
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    },
  }), AuthorizationModule, UsersModule, PrismaModule, DeveloperModule],
  controllers: [StateController, IndexController],
  providers: [],
})
export class AppModule {
}
