import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  public static ALLOW_LIST = ["/api", "/api/security/users/signin", "/api/security/users/signup"];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (JwtAuthGuard.ALLOW_LIST.includes(request.url)) {
      return true;
    }
    return <boolean>super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
