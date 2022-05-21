import { Module } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { UsersController } from "../controllers/users.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "src/guards/local.strategy";
import { JwtStrategy } from "src/guards/jwt.strategy";
import { BackpacksModule } from "./backpacks.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APPLICATION_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
    PassportModule,
    BackpacksModule,
  ],
  providers: [UsersService, LocalStrategy, JwtStrategy],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
