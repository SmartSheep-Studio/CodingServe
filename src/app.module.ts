import { Module } from "@nestjs/common";
import { StateController } from "./controllers/state.controller";
import { UsersModule } from "./modules/users.module";
import { PrismaModule } from "./modules/prisma.module";
import { DeveloperModule } from "./modules/developers/developers.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { OnlineEventInterceptor } from "./interceptors/OnlineEvent.interceptor";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LocksModule } from "./modules/locks.module";
import { LocksGuard } from "./decorators/locks.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { OperationModule } from "./modules/operations.module";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: process.env.SMTP_URL,
      defaults: {
        from: process.env.SMTP_FROM,
      },
      template: {
        dir: join(__dirname, "..", "..", "templates"),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "ui"),
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    UsersModule,
    PrismaModule,
    DeveloperModule,
    LocksModule,
    OperationModule,
  ],
  controllers: [StateController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: OnlineEventInterceptor },
    { provide: APP_GUARD, useClass: LocksGuard },
  ],
})
export class AppModule {}
