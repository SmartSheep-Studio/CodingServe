import {Module} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {AuthorizationController} from './authorization.controller';
import {LocalStrategy} from "./guards/local.strategy";
import {PassportModule} from "@nestjs/passport";
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {JwtStrategy} from "./guards/jwt.strategy";
import {GroupsModule} from '../groups/groups.module';
import { OauthModule } from './oauth/oauth.module';

@Module({
    imports: [UsersModule, PassportModule, JwtModule.register({
        secret: AuthorizationService.secret,
        signOptions: {expiresIn: '14d'}
    }), GroupsModule, OauthModule],
    providers: [AuthorizationService, LocalStrategy, JwtStrategy],
    controllers: [AuthorizationController],
    exports: [AuthorizationService]
})
export class AuthorizationModule {
}
