import { forwardRef, Module } from "@nestjs/common";
import { OauthController } from "../../controllers/developers/oauth.controller";
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "src/services/users.service";

@Module({
  controllers: [OauthController],
  imports: [
    forwardRef(() => UsersService),
    JwtModule.register({
      secret: process.env.APPLICATION_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
})
export class OauthModule {}
