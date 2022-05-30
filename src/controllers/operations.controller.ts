import { Controller, Get, Request, Query, Post, Body, HttpCode, Res, Patch } from "@nestjs/common";
import { Permissions } from "../decorators/permissions.decorator";
import { OperationsService } from "../services/operations.service";
import { PrismaService } from "../services/prisma.service";
import { BackpacksService } from "../services/backpacks.service";
import { UsersService } from "../services/users.service";

@Controller("/operations")
export class OperationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly operationsService: OperationsService,
    private readonly backpacksService: BackpacksService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async listAllOperations(
    @Request() request: any,
    @Query("take") take = 10000,
    @Query("skip") skip = 0,
    @Query("ignore") ignore?: string,
    @Query("unfinished") unfinished?: string,
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
    const filtered = [];
    for (const item of response) {
      for (const judge of item.data["judgement"]) {
        if (judge.hidden) {
          item.data["judgement"] = item.data["judgement"].filter((value: any) => {
            return value !== judge;
          });
        }
      }
      if (unfinished === "yes") {
        if ((await this.prisma.operation_logs.count({ where: { operation: item.id, in_progress: true } })) === 0) {
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    }
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch current all available operations",
      },
      Response: filtered,
    };
  }

  @Get("/logs")
  async listAllOperationLogs(
    @Request() request: any,
    @Query("take") take = 10000,
    @Query("skip") skip = 0,
    @Query("ignore") ignore?: string,
  ) {
    const response = await this.prisma.operation_logs.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
      where: Object.assign({ uid: request.user.id }, ignore === "yes" ? {} : { status: "working" }),
    });
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch all your operation logs",
      },
      Response: response,
    };
  }

  @Get("/progress")
  async listAllFinishedOperation(
    @Request() request: any,
    @Query("take") take = 10,
    @Query("skip") skip = 0,
    @Query("simple") simple?: string,
  ) {
    const response = await this.prisma.operation_logs.findMany({
      orderBy: { created_at: "desc" },
      skip: skip,
      take: take,
      where: { uid: request.user.id, in_progress: true },
    });
    if (simple === "yes") {
      const simpleResponse = [];
      for (const item of response) {
        simpleResponse.push(item.operation);
        return {
          Status: {
            Code: "OK",
            Message: "Successfully fetch your operation progress",
          },
          Response: simpleResponse,
        };
      }
    } else {
      return {
        Status: {
          Code: "OK",
          Message: "Successfully fetch your operation progress",
        },
        Response: response,
      };
    }
  }

  @Post()
  @HttpCode(200)
  @Permissions("create:operations")
  async createNewOperation(
    @Request() request: any,
    @Res() res: any,
    @Body("title") title: string,
    @Body("description") description: string,
    @Body("story") story: string,
    @Body("category") category: string,
    @Body("data") data: object,
    @Body("costs") costs: Array<object>,
    @Body("rewards") rewards: Array<object>,
    @Body("judgement") judgement: Array<object>,
    @Body("conditions") conditions: object,
    @Body("publisher") publisher?: string,
    @Body("id") id?: string,
  ) {
    let response;
    try {
      response = await this.operationsService.createNewOperation(
        data,
        conditions,
        judgement,
        rewards,
        costs,
        publisher ? publisher : request.user.id,
        category,
        story,
        title,
        description,
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
  async getOperationDetail(@Request() request: any, @Query("id") id: string) {
    const { operation, logs } = await this.operationsService.getOperationDetail(request.user.id, id);
    return {
      Status: {
        Code: "OK",
        Message: "Successfully fetch operation detail",
      },
      Response: {
        Operation: operation,
        Logs: logs,
      },
    };
  }

  @Post("/start")
  @HttpCode(200)
  async startOperation(@Request() request: any, @Res() res: any, @Body("id") id: string) {
    const slots = 3 - (await this.prisma.operation_logs.count({ where: { uid: request.user.id, status: "working" } }));
    if (slots - 1 <= 0) {
      return res.status(402).send({
        Status: {
          Code: "SLOT_FULLED",
          Message: "Cannot start operation, 3 slot is fulled.",
        },
        Response: null,
      });
    }
    const isDuplicated =
      (await this.prisma.operation_logs.count({
        where: {
          uid: request.user.id,
          status: "working",
          operation: id,
        },
      })) !== 0;
    if (isDuplicated) {
      return res.status(400).send({
        Status: {
          Code: "OPERATION_STARTED",
          Message: "Cannot start operation, this operation is already started.",
        },
        Response: null,
      });
    }
    const response = await this.operationsService.startOperation(request.user.id, id);
    if (response == null) {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "DISSATISFY_THE_CONDITIONS",
          Message: "Cannot start operation, dissatisfy the operation start condition",
        },
        Response: response,
      });
    } else if (response instanceof Array) {
      return res.status(402).send({
        Status: {
          Code: "NOT_ENOUGH_RESOURCES",
          CodeDetail: "ENERGY_NOT_ENOUGH",
          Message: "Cannot start operation, cannot pay the cost",
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

  @Patch("/cancel")
  @HttpCode(200)
  async cancelOperation(@Request() request: any, @Res() res: any, @Body("id") id: string) {
    const record = await this.operationsService.cancelOperation(request.user.id, Number.parseInt(id));
    if (record == null) {
      res.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          Message: "Cannot cancel operation, record not found",
        },
        Response: null,
      });
    } else {
      res.send({
        Status: {
          Code: "OK",
          Message: "Successfully cancel operation",
        },
        Response: record,
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
    if (!(await this.backpacksService.checkMaterialToBackpack(request.user.backpack_id, { id: "energy", amount: 1 }))) {
      return res.status(402).send({
        Status: {
          Code: "NOT_ENOUGH_RESOURCES",
          Message: "Cannot commit operation, cannot pay the cost",
        },
        Response: null,
      });
    }
    const response = await this.operationsService.commitOperation(id, code, runtime, runtimeVersion);
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
      // Release rewards
      if (response.Finished && response.InProgress) {
        await this.usersService.addUserExperience(
          await this.prisma.users.findUnique({ where: { id: request.user.id } }),
          BigInt(process.env.OPERATION_COMPLETED_EXPERIENCE_REWARD),
        );
        await this.backpacksService.addMaterialsToBackpack(request.user.backpack_id, response.Rewards);
      }
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
