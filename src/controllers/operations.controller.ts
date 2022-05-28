import { Controller, Get, Request, Query, Post, Body, HttpCode, Res } from "@nestjs/common";
import { OperationService } from "../services/operations.service";
import { PrismaService } from "../services/prisma.service";

@Controller("/operations")
export class OperationController {
  constructor(private readonly prisma: PrismaService, private readonly operationService: OperationService) {}

  @Get()
  async listAllAvailableOperations(@Request() request: any, @Query("take") take = 10000, @Query("skip") skip = 0) {
    const response = await this.prisma.operations.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
      where: { conditions: { path: "$.level", lt: request.user.level } },
    });
    for (const item of response) {
      for (const judge of item.data["judgement"]) {
        if (judge.hidden) {
          delete item.data["judgement"][item.data["judgement"].indexOf(judge)];
        }
      }
    }
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch current all available operations",
      },
      Response: response,
    };
  }

  @Post()
  @HttpCode(200)
  async createNewOperation(
    @Request() request: any,
    @Res() res: any,
    @Body("data") data: object,
    @Body("conditions") conditions: object,
    @Body("publisher") publisher?: string,
    @Body("id") id?: string,
  ) {
    let response;
    try {
      response = await this.operationService.createNewOperation(
        data,
        conditions,
        publisher ? publisher : request.user.id,
        id,
      );
    } catch (err) {
      return res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "DATABASE_ERROR",
          Message: "Cannot create new operation",
          MessageDetail: err,
        },
        Response: response,
      });
    }
    return res.send({
      Status: {
        Code: "OK",
        Message: "Successfully create new operation",
      },
      Response: response,
    });
  }
}
