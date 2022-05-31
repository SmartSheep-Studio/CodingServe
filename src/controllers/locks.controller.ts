import { Body, Controller, HttpCode, Post, Request, UseGuards } from "@nestjs/common";
import { LocksService } from "../services/locks.service";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { PermissionsGuard } from "../decorators/permissions.guard";
import { Permissions } from "../decorators/permissions.decorator";

@Controller("/security/locks")
export class LocksController {
  constructor(private readonly locksService: LocksService) {}

  @Post("/user")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("lock:users")
  async lockUser(
    @Request() request: any,
    @Body("id") uid: string,
    @Body("description") description: string,
    @Body("expired_at") expired: string,
  ) {
    await this.locksService.lockUser(request.user.id, uid, description, true, new Date(expired));
    return {
      Status: {
        Code: "OK",
        Message: "Successfully lock user " + uid + ".",
      },
      Response: null,
    };
  }
}
