import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthorizationService } from '../authorization.service';

@Module({
  controllers: [OauthController],
  imports: [
    JwtModule.register({
      secret: AuthorizationService.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class OauthModule {}
