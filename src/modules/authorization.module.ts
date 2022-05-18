import { Module } from '@nestjs/common';
import { AuthorizationService } from '../services/authorization.service';
import { AuthorizationController } from '../controllers/authorization.controller';
import { LocalStrategy } from '../guards/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../guards/jwt.strategy';
import { GroupsModule } from './groups.module';
import { OauthModule } from './developers/oauth.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: AuthorizationService.secret,
      signOptions: { expiresIn: '14d' },
    }),
    GroupsModule,
    OauthModule,
  ],
  providers: [AuthorizationService, LocalStrategy, JwtStrategy],
  controllers: [AuthorizationController],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
