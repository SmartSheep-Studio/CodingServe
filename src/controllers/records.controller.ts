import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { PrismaService } from "../services/prisma.service";
import { RecordsService } from "../services/records.service";

@Controller("/records")
export class RecordsController {
  constructor(private readonly prisma: PrismaService, private readonly recordsService: RecordsService) {}

  @Get("/")
  @UseGuards(JwtAuthGuard)
  async listRecords(@Query("take") take = 10000, @Query("skip") skip = 0, @Query("type") type?: string) {
    const response = await this.prisma.records_activites.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
    });
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch your activities records",
      },
      Response: response,
    };
  }
}
