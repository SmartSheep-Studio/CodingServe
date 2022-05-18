import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SCOPES_KEY } from "./scope.decorator";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredScopes) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (user.client == null) {
      return true;
    }
    const scopes = user.client.scopes as Array<string>;
    if (scopes.includes("all")) {
      return true;
    }
    return requiredScopes.some((scope) => scopes?.includes(scope));
  }
}
