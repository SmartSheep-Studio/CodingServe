import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { users as UserModel } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

type Material = {
  id: string;
  amount: number;
  attributes?: object;
  isOverride?: boolean;
};

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

  async addMaterialToBackpack(id: string, material: Material) {
    const backpack = await this.prisma.backpacks.findUnique({ where: { id: id } });
    if (backpack == null) {
      return null;
    }

    const updateTo = Object.assign(backpack.materials, {
      [material.id]: {
        amount: material.isOverride
          ? material.amount
          : (backpack.materials[material.id] ? backpack.materials[material.id].amount : 0) + material.amount,
        attributes: Object.assign(
          backpack.materials[material.id] ? backpack.materials[material.id].amount : {},
          material.attributes ? material.attributes : {},
        ),
      },
    });

    return await this.prisma.backpacks.update({ where: { id: id }, data: { materials: updateTo } });
  }

  async addMaterialsToBackpack(id: string, materials: Array<Material>) {
    const backpack = await this.prisma.backpacks.findUnique({ where: { id: id } });
    if (backpack == null) {
      return null;
    }

    let updateTo = backpack.materials;
    for (const material of materials) {
      updateTo = Object.assign(updateTo, {
        [material.id]: {
          amount: material.isOverride
            ? material.amount
            : (backpack.materials[material.id] ? backpack.materials[material.id].amount : 0) + material.amount,
          attributes: Object.assign(
            backpack.materials[material.id] ? backpack.materials[material.id].amount : {},
            material.attributes ? material.attributes : {},
          ),
        },
      });
    }

    return await this.prisma.backpacks.update({ where: { id: id }, data: { materials: updateTo } });
  }
}
