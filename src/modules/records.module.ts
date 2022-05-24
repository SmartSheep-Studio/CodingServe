import { Module } from "@nestjs/common";
import { RecordsService } from "../services/records.service";
import { RecordsController } from "../controllers/records.controller";

@Module({
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
