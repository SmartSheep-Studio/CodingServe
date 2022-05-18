import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";
import { users as UserModel, developer_clients as ClientModel } from "@prisma/client";

@Injectable()
export class AuthorizationService {
  public static secret = process.env.APPLICATION_SECRET;

  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<UserModel | null> {
    const user = await this.usersService.getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async signJWT(user: UserModel) {
    const payload = {
      type: "signin",
      user: { username: user.username, uid: user.id },
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async signClientJWT(client: ClientModel, user: UserModel) {
    const payload = {
      type: "oauth",
      user: { username: user.username, uid: user.id },
      client: { id: client.client_id, name: client.name },
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
