import { Controller, Get, Request, Query, Post, Body, HttpCode, Res } from "@nestjs/common";
import { Permissions } from "../decorators/permissions.decorator";
import { OperationService } from "../services/operations.service";
import { PrismaService } from "../services/prisma.service";

@Controller("/operations")
export class OperationController {
  constructor(private readonly prisma: PrismaService, private readonly operationService: OperationService) {}

  @Get()
  async listAllOperations(
    @Request() request: any,
    @Query("take") take = 10000,
    @Query("skip") skip = 0,
    @Query("ignore") ignore?: string,
  ) {
    const response = await this.prisma.operations.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
      where: Object.assign(
        { status: "published" },
        ignore === "yes" ? {} : { conditions: { path: "$.level", lte: request.user.level } },
      ),
    });
    for (const item of response) {
      for (const judge of item.data["judgement"]) {
        if (judge.hidden) {
          item.data["judgement"] = item.data["judgement"].filter((value: any) => {
            return value !== judge;
          });
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
  @Permissions("create:operations")
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

  @Get("/detail")
  async getOperationDetail(@Query("id") id: string) {
    const { operation, records } = await this.operationService.getOperationDetail(id);
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch operation detail",
      },
      Response: {
        Operation: operation,
        Records: records,
      },
    };
  }

  @Post("/start")
  @HttpCode(200)
  async startOperation(@Request() request: any, @Res() res: any, @Body("id") id: string) {
    const response = await this.operationService.startOperation(request.user.id, id);
    if (response == null) {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "DISSATISFY_THE_CONDITIONS",
          Message: "Cannot start operation, dissatisfy the operation start condition",
        },
        Response: response,
      });
    } else {
      res.send({
        Status: {
          Code: "OK",
        },
        Response: response,
      });
    }
  }

  @Post("/commit")
  @HttpCode(200)
  async commitOperation(
    @Request() request: any,
    @Res() res: any,
    @Body("id") id: number,
    @Body("code") code: string,
    @Query("runtime") runtime: string,
    @Query("runtimeVersion") runtimeVersion: string,
  ) {
    if (code.replace(" ", "") === "") {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "CODE_CANNOT_AS_NULL",
          Message: "Cannot commit operation, code is null.",
        },
        Response: null,
      });
      return;
    }
    const response = await this.operationService.commitOperation(id, code, runtime, runtimeVersion);
    if (response.Message === "RUNTIME_NOT_AVAILABLE") {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: response.Message,
          Message:
            "Cannot commit operation, runtime not available, please change a language or contact the administrator.",
        },
        Response: null,
      });
    } else if (response.Message === "RECORD_NOT_FOUND") {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: response.Message,
          Message: "Cannot commit operation, record not found, please start operation first.",
        },
        Response: null,
      });
    } else {
      res.send({
        Status: {
          Code: response.Finished ? "FINISHED" : "OK",
          Message: response.Finished
            ? "Current operation is finish, operation automatic closed."
            : "Successfully commit operation.",
        },
        Response: response,
      });
    }
  }
}
