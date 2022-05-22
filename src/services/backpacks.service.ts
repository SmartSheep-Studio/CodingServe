import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { users as UserModel } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class BackpacksService {
  constructor(private readonly prisma: PrismaService) {}

  public static presents = {
    "code-coin": { amount: 1200, attributes: {} },
    rational: { amount: 86, attributes: {} },
    energy: { amount: 20, attributes: {} },
    "share-ticket": { amount: 10, attributes: {} },
  };

  async createBackpack(present = false, id = uuidv4()) {
    return await this.prisma.backpacks.create({
      data: {
        id: id,
        materials: present ? BackpacksService.presents : {},
      },
    });
  }

  createBackpackSynchronous(present = false, id = uuidv4()) {
    return this.prisma.backpacks.create({
      data: {
        id: id,
        materials: present ? BackpacksService.presents : {},
      },
    });
  }

  async createBackpackAndAssign(user: UserModel, override = false) {
    if (!override && user.backpack_id !== "") {
      return;
    }
    const backpackId = uuidv4();
    await this.prisma.$transaction([
      this.prisma.backpacks.create({
        data: {
          id: backpackId,
          materials: BackpacksService.presents,
        },
      }),
      this.prisma.users.update({
        where: { id: user.id },
        data: { backpack_id: backpackId },
      }),
    ]);
  }
}
