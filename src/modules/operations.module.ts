import { Module } from "@nestjs/common";
import { OperationController } from "../controllers/operations.controller";
import { OperationService } from "../services/operations.service";

@Module({
  controllers: [OperationController],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
