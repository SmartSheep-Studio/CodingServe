import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class OperationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewOperation(data: object, conditions: object, publisher: string, id?: string) {
    return await this.prisma.operations.create({
      data: {
        id: id ? id : uuidv4(),
        data: data,
        conditions: conditions,
        publisher: publisher,
      },
    });
  }
}
