import { Injectable } from "@nestjs/common";
import { users as UserModel, developer_clients as ClientModel, PrismaPromise } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { BackpacksService } from "./backpacks.service";

@Injectable()
export class UsersService {
  public static secret = process.env.APPLICATION_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly backpacksService: BackpacksService,
  ) {}

  async getUserByUID(uid: string): Promise<any> {
    return await this.prisma.users.findUnique({ where: { id: uid } });
  }

  async getUserByUsername(username: string): Promise<any> {
    return await this.prisma.users.findUnique({ where: { username: username } });
  }

  async getUserByEmail(email: string): Promise<any> {
    return await this.prisma.users.findUnique({ where: { email: email } });
  }

  async validateUser(username: string, password: string): Promise<UserModel | null> {
    const user = await this.getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async createUser(user: UserModel) {
    user.attributes = user.attributes ? user.attributes : {};
    user.permissions = user.permissions ? user.permissions : [];
    user.description = user.description ? user.description : "He didn't write any things...";
    user.backpack_id = "";
    user.group_id = "";
    user.group_id = user.group_id ? user.group_id : "";
    user.lock_id = "";
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    user = await this.prisma.users.create({ data: user });
    await this.backpacksService.createBackpackAndAssign(user);
    return user;
  }

  createUserSynchronous(user: UserModel): PrismaPromise<any> {
    user.attributes = user.attributes ? user.attributes : {};
    user.permissions = user.permissions ? user.permissions : [];
    user.description = user.description ? user.description : "He didn't write any things...";
    user.backpack_id = user.backpack_id ? user.backpack_id : "";
    user.group_id = "";
    user.group_id = user.group_id ? user.group_id : "";
    user.lock_id = "";
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
    return this.prisma.users.create({ data: user });
  }

  async activeUser(active_code: string) {
    const code = await this.prisma.user_tokens.findUnique({
      where: { token: active_code },
    });
    if (code == null) {
      return false;
    }
    if (new Date(code.created_at.getTime() + 1000 * 60 * 60 * 2).getTime() <= Date.now()) {
      return false;
    }
    if (code.type === "active") {
      const user = await this.prisma.users.findUnique({
        where: { id: code.issuer_id },
      });
      user.is_active = true;
      await this.prisma.users.update({ where: { id: user.id }, data: user });
      await this.prisma.user_tokens.deleteMany({ where: { issuer_id: user.id } });
      return true;
    }
  }

  signJWT(user: UserModel) {
    const payload = {
      type: "signin",
      user: { username: user.username, uid: user.id },
    };
    return this.jwtService.sign(payload);
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
