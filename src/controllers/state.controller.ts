import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import * as packages from "../../package.json";

@Controller("/")
@ApiTags("States")
export class StateController {
  @Get()
  getState(): object {
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch server information and modules statues",
      },
      Response: {
        Message: process.env.SERVER_MAINTENANCE
          ? "All service and module are working perfectly!"
          : process.env.SERVER_MAINTENANCE_DESCRIPTION,
        Services: process.env.SERVER_MAINTENANCE && process.env.SERVER_MAINTENANCE_DISABLE ? "DOWN" : "UP",
        Version: packages.version,
      },
    };
  }
}
