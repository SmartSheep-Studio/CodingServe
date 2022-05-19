import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../services/users.service";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APPLICATION_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      if (payload.type === "oauth") {
        const user = await this.usersService.getUserByUID(payload.user.uid);
        const client = await this.prisma.developer_clients.findUnique({
          where: { client_id: payload.client.id },
        });
        delete client["client_secret"];
        return Object.assign(user, { client: client });
      } else {
        return await this.usersService.getUserByUID(payload.user.uid);
      }
    } catch (e) {
      return null;
    }
  }
}
