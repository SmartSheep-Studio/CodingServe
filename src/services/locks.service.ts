import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class LocksService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewLock(issuer: string, description: string, instance = false, expiredAt = null) {
    return await this.prisma.locks.create({
      data: {
        id: uuidv4(),
        issuer_id: issuer,
        description: description,
        status: instance ? "locked" : "processing",
        expired_at: expiredAt,
      },
    });
  }

  async lockUser(issuer: string, uid: string, description: string, instance = false, expiredAt = null) {
    const lock = await this.createNewLock(issuer, description, instance, expiredAt);
    if (lock.status === "locked") {
      await this.prisma.users.update({
        where: { id: uid },
        data: {
          is_locked: true,
          lock_id: lock.id,
        },
      });
    }
  }
}
