import { Module } from '@nestjs/common';
import { BanksController } from '../controllers/banks.controller';
import { BanksService } from '../services/banks.service';

@Module({
  controllers: [BanksController],
  providers: [BanksService]
})
export class BankModule {}
