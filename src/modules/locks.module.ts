import { Module } from "@nestjs/common";
import { LocksService } from "../services/locks.service";
import { LocksController } from "../controllers/locks.controller";

@Module({
  controllers: [LocksController],
  providers: [LocksService],
  exports: [LocksService],
})
export class LocksModule {}
