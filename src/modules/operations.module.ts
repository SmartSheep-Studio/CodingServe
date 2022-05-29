import { Module } from "@nestjs/common";
import { OperationController } from "../controllers/operations.controller";
import { OperationsService } from "../services/operations.service";
import { RecordsModule } from "./records.module";
import { BackpacksModule } from "./backpacks.module";

@Module({
  controllers: [OperationController],
  imports: [RecordsModule, BackpacksModule],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationModule {}
