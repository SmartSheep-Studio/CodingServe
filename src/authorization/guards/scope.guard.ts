import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from './scope.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredScopes) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (user.client == null) {
      return true;
    }
    if (
      user.client.scope === 'all' ||
      user.client.scope.split(',').includes('all')
    ) {
      return true;
    }
    const scopes = user.client.scope;
    return requiredScopes.some((scope) => scopes?.includes(scope));
  }
}
