import { Injectable } from "@nestjs/common";
import { users as UserModel, developer_clients as ClientModel, PrismaPromise } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { BackpacksService } from "./backpacks.service";
import MaterialsUtils from "../utils/MaterialsUtils";
import { RecordsService } from "./records.service";

@Injectable()
export class UsersService {
  public static secret = process.env.APPLICATION_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly backpacksService: BackpacksService,
    private readonly recordsService: RecordsService,
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

  computeRequireExperience(level) {
    return BigInt(
      Math.round(
        level *
          Number.parseInt(process.env.LEVEL_PERLEVEL_UPGRADE_REQUIRE) *
          Number.parseFloat(process.env.LEVEL_PERLEVEL_UPGRADE_DIFFICULTY),
      ),
    );
  }

  async userUpgrade(user: UserModel, force = false) {
    if (!force) {
      let requirement: bigint;
      requirement = this.computeRequireExperience(user.level);
      if (user.level_experience < requirement) {
        return false;
      }
      while (user.level_experience >= requirement) {
        requirement = this.computeRequireExperience(user.level);
        user.level++;
        user.level_experience -= requirement;
      }
    } else {
      user.level++;
      user.level_experience = BigInt(0);
    }
    await this.prisma.users.update({
      where: { id: user.id },
      data: { level: user.level, level_experience: user.level_experience },
    });
    return true;
  }

  async addUserExperience(user: UserModel, amount: bigint) {
    user = await this.prisma.users.update({
      where: { id: user.id },
      data: { level_experience: user.level_experience + amount },
    });
    return await this.userUpgrade(user);
  }

  async updateLastOnlineIP(uid: string, ip: string) {
    await this.prisma.users.update({ where: { id: uid }, data: { last_online_at: new Date(), last_online_ip: ip } });
  }

  async userDailySignin(user: UserModel): Promise<object | null> {
    if (user.last_signin_at != null) {
      if (user.last_signin_at.toDateString() === new Date().toDateString()) {
        return null;
      }
    }
    const rewards = {
      Experience: 1800,
      CodeCoin: Math.floor(Math.random() * (user.level * 100 + 2000)),
      Rational: 86 + (user.level - 1) * 2,
      Energy: 20 + (user.level - 1) * 8,
      ShareTicket: 10 + (user.level - 1),
    };

    await this.addUserExperience(user, BigInt(rewards.Experience));
    const backpack = await this.prisma.backpacks.findUnique({ where: { id: user.backpack_id } });

    const updateTo = {
      "code-coin": {
        amount: MaterialsUtils.getMaterialAmount(backpack.materials, "code-coin") + rewards.CodeCoin,
        attributes: backpack.materials["code-coin"].attributes,
      },
      rational: {
        amount: rewards.Rational,
        attributes: backpack.materials["rational"].attributes,
      },
      energy: {
        amount: rewards.Energy,
        attributes: backpack.materials["energy"].attributes,
      },
      "share-ticket": {
        amount: rewards.ShareTicket,
        attributes: backpack.materials["share-ticket"].attributes,
      },
    };

    await this.prisma.$transaction([
      this.prisma.users.update({ where: { id: user.id }, data: { last_signin_at: new Date() } }),
      this.prisma.backpacks.update({
        where: { id: user.backpack_id },
        data: { materials: Object.assign(backpack.materials, updateTo) },
      }),
    ]);

    await this.recordsService.createNewActivityRecord("signin", { rewards: rewards });

    return rewards;
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
