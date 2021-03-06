import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { developer_clients as ClientModel, users as UserModel } from "@prisma/client";

@Injectable()
export class DeveloperService {
  constructor(private readonly prisma: PrismaService) {}

  async signup_developer(user: UserModel) {
    if (!user) {
      throw new Error("DATA_NOT_FOUND");
    }
    if (user.group_id !== "") {
      throw new Error("OVERWRITE_NEEDED");
    }
    let developer_group = await this.prisma.user_groups.findUnique({
      where: { name: "Developer" },
    });
    if (!developer_group) {
      console.warn("[AAR] Didn't found developer group, created.");
      developer_group = await this.prisma.user_groups.create({
        data: {
          id: uuidv4(),
          name: "Developer",
          description: "The CodingLand third party developer group",
          permissions: ["all:developer"],
        },
      });
    }
    await this.prisma.users.update({
      where: { id: user.id },
      data: { group_id: developer_group.id },
    });
  }

  async register_client(developer: UserModel, client: ClientModel) {
    client.id = uuidv4();
    const origin_secret = uuidv4().replace("-", "").toUpperCase();
    client.client_secret = await bcrypt.hash(origin_secret, await bcrypt.genSalt());
    client.client_id = uuidv4().replace("-", "").toUpperCase();
    client.developer_id = developer.id;
    const data = await this.prisma.developer_clients.create({
      data: client,
    });
    data.client_secret = origin_secret;
    return data;
  }
}
