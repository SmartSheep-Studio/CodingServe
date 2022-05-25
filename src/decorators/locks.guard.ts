import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class LocksGuard implements CanActivate {
  public static ALLOW_LIST = ["/api/security/users/profile", "/api/security/users/profile?detail=yes"];

  constructor(private readonly usersService: UsersService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.user != null) {
      if (request.user.is_locked) {
        const lock = await this.prisma.locks.findUnique({ where: { id: request.user.lock_id } });
        if (lock.expired_at != null) {
          if (new Date(lock.expired_at) <= new Date()) {
            await this.prisma.locks.update({ where: { id: request.user.lock_id }, data: { status: "unlocked" } });
            await this.prisma.users.update({
              where: { id: request.user.id },
              data: { lock_id: "", is_locked: false },
            });
            console.log("[LOCKS] One user out of jail: " + request.user.username);
            return true;
          }
        }
        return LocksGuard.ALLOW_LIST.includes(request.url);
      }
    }
    return true;
  }
}
