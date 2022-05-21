import { Module } from "@nestjs/common";
import { BackpacksService } from "../services/backpacks.service";

@Module({
  providers: [BackpacksService],
  exports: [BackpacksService],
})
export class BackpacksModule {}
