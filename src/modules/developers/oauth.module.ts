import { forwardRef, Module } from "@nestjs/common";
import { OauthController } from "../../controllers/developers/oauth.controller";
import { JwtModule } from "@nestjs/jwt";
import { AuthorizationService } from "../../services/authorization.service";
import { AuthorizationModule } from "../authorization.module";

@Module({
  controllers: [OauthController],
  imports: [
    forwardRef(() => AuthorizationModule),
    JwtModule.register({
      secret: AuthorizationService.secret,
      signOptions: { expiresIn: "1h" },
    }),
  ],
})
export class OauthModule {}
