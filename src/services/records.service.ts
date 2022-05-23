import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewActivityRecord(type: string, data: object) {
    return await this.prisma.records_activites.create({
      data: {
        type: type,
        data: data,
      },
    });
  }

  createNewActivityRecordSynchronous(type: string, data: object) {
    return this.prisma.records_activites.create({
      data: {
        type: type,
        data: data,
      },
    });
  }
}
