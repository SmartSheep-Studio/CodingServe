import { Module } from "@nestjs/common";
import { RecordsService } from "../services/records.service";

@Module({
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
