import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // Fetch user group information
    const group = await this.prisma.user_groups.findUnique({
      where: { id: user.group_id },
    });
    if (group == null) {
      return false;
    }
    // Authentication
    const permissions = Object.assign(user.permissions, group.permissions);
    return requiredPermissions.some((permission) => {
      if (permissions.includes("*")) {
        return true;
      }
      return permissions?.includes(permission);
    });
  }
}
