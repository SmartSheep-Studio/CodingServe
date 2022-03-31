import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (user.group_id === 0) {
      return false;
    }
    const group = await this.prisma.groups.findUnique({
      where: { id: user.group_id },
    });
    if (group == null) {
      console.error(
        `Failed to query user group permission: User group(${user.group_id}(invalid)), couldn't find in database.`,
      );
      return false;
    }
    const permissions = group.permissions;
    if (!Array.isArray(permissions)) {
      console.error(
        `Failed to query user group permission: User group(${group.id}) permission isn't array.`,
      );
      return false;
    }
    return requiredPermissions.some((permission) =>
      permissions?.includes(permission),
    );
  }
}
