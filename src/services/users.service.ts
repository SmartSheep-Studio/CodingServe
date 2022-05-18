import { v4 as uuidv4 } from "uuid";
import { Injectable } from "@nestjs/common";
import { users as UserModel } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByUsername(username: string): Promise<any> {
    return await this.prisma.users.findUnique({
      where: { username: username },
    });
  }

  async getUserById(uid: string): Promise<any> {
    return await this.prisma.users.findUnique({ where: { id: uid } });
  }

  async createUser(user: UserModel) {
    user.id = uuidv4();
    user.attributes = user.attributes ? user.attributes : {};
    user.group_id = user.group_id ? user.group_id : "";
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    await this.prisma.users.create({ data: user });
    return user;
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
}
