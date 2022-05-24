import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewActivityRecord(uid: string, type: string, data: object) {
    return await this.prisma.records_activites.create({
      data: {
        uid: uid,
        type: type,
        data: data,
      },
    });
  }

  createNewActivityRecordSynchronous(uid: string, type: string, data: object) {
    return this.prisma.records_activites.create({
      data: {
        uid: uid,
        type: type,
        data: data,
      },
    });
  }
}
