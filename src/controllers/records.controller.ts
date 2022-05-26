import { Body, Controller, Get, Put, Query, Request, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../decorators/permissions.guard";
import { PrismaService } from "../services/prisma.service";
import { RecordsService } from "../services/records.service";
import { Permissions } from "../decorators/permissions.decorator";

@Controller("/records")
export class RecordsController {
  constructor(private readonly prisma: PrismaService, private readonly recordsService: RecordsService) {}

  @Get("/activities")
  async listActivitiesRecords(@Request() request: any, @Query("take") take = 10000, @Query("skip") skip = 0) {
    const response = await this.prisma.records_activites.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
      where: { uid: request.user.id },
    });
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch your activities records",
      },
      Response: response,
    };
  }

  @Put("/announcements")
  @UseGuards(PermissionsGuard)
  @Permissions("write:announcements")
  async createAnnouncementsRecord(
    @Request() request: any,
    @Body("type") type: string,
    @Body("data") data: object,
    @Body("publisher") publisher?: string,
  ) {
    const response = await this.recordsService.createNewAnnouncementsRecord(
      publisher ? publisher : request.user.id,
      type,
      data ? data : {},
    );
    return {
      Status: {
        Code: "OK",
        Message: "Successfully create new announcement record",
      },
      Response: response,
    };
  }

  @Get("/announcements")
  async listAnnouncementsRecords(@Query("take") take = 10000, @Query("skip") skip = 0) {
    const response = await this.prisma.records_announcements.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
    });
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch current node announcements records",
      },
      Response: response,
    };
  }
}
