import { Module } from "@nestjs/common";
import { OperationController } from "../controllers/operations.controller";
import { OperationsService } from "../services/operations.service";
import { RecordsModule } from "./records.module";
import { BackpacksModule } from "./backpacks.module";
import { UsersModule } from "./users.module";

@Module({
  controllers: [OperationController],
  imports: [RecordsModule, BackpacksModule, UsersModule],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationModule {}
