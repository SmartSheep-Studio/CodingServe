import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { UsersService } from "../services/users.service";

@Injectable()
export class OnlineEventInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.getArgByIndex(1).req;
    return next.handle().pipe(
      map(async (data) => {
        if (request.user != null) {
          await this.usersService.updateLastOnlineIP(request.user.id, request.ip);
        }
        return data;
      }),
    );
  }
}
