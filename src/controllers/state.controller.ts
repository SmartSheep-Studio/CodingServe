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
          ? process.env.SERVER_MAINTENANCE_DESCRIPTION
          : "All service and module are working perfectly!",
        Services: process.env.SERVER_MAINTENANCE ? "DOWN" : "UP",
        NodeName: "Logic Mainland",
        Version: packages.version,
        Details: {
          Level: {
            Difficulty: process.env.LEVEL_PERLEVEL_UPGRADE_DIFFICULTY,
            Requirement: process.env.LEVEL_PERLEVEL_UPGRADE_REQUIRE,
          },
        },
      },
    };
  }
}
