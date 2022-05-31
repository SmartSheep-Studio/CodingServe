import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { v4 as uuidv4 } from "uuid";
import {
  operations as OperationModel,
  operation_logs as OperationLogModel,
  operation_commits as OperationCommitModel,
} from "@prisma/client";
import { BackpacksService } from "./backpacks.service";
import axios from "axios";
import exp from "constants";

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService, private readonly backpacksService: BackpacksService) {}

  async createNewOperation(
    data: object,
    conditions: object,
    judgement: Array<object>,
    rewards: Array<object>,
    costs: Array<object>,
    publisher: string,
    category: string,
    story: string,
    title: string,
    description?: string,
    id?: string,
    expired_at?: Date,
  ) {
    return await this.prisma.operations.create({
      data: {
        id: id ? id : uuidv4(),
        data: data,
        conditions: conditions,
        judgement: judgement,
        publisher: publisher,
        rewards: rewards,
        costs: costs,
        category: category,
        title: title,
        description: description ? description : "",
        story: story,
        expired_at: expired_at,
      },
    });
  }

  async getOperationDetail(uid: string, id: string): Promise<{ operation: OperationModel; logs: OperationLogModel[] }> {
    const operation = await this.prisma.operations.findFirst({ where: { id: id, status: "published" } });
    const logs = await this.prisma.operation_logs.findMany({ where: { uid: uid, operation: id } });
    return { operation, logs };
  }

  async startOperation(uid: string, id: string) {
    const user = await this.prisma.users.findUnique({ where: { id: uid } });
    const operation = await this.prisma.operations.findUnique({ where: { id: id } });
    const progress = await this.prisma.operation_logs.count({
      where: { uid: user.id, status: "finished", in_progress: true },
    });

    if (operation.status !== "published") {
      return null;
    } else if (user.level < operation.conditions["level"]) {
      return null;
    } else if (progress < operation.conditions["progress"]) {
      return null;
    } else if (
      !(await this.backpacksService.checkMaterialsToBackpack(user.backpack_id, operation.costs as Array<any>))
    ) {
      return operation.costs as Array<any>;
    } else {
      await this.backpacksService.deleteMaterialsToBackpack(user.backpack_id, operation.costs as Array<any>);
      const [record] = await this.prisma.$transaction([
        this.prisma.operation_logs.create({
          data: { uid: user.id, operation: operation.id, status: "working" },
        }),
        this.prisma.records_activites.create({
          data: {
            uid: user.id,
            type: "operation",
            data: { operation: operation.id },
          },
        }),
      ]);
      return record;
    }
  }

  async cancelOperation(uid: string, id: number) {
    const record = await this.prisma.operation_logs.findFirst({ where: { uid: uid, id: id, status: "working" } });
    if (record == null || record.status !== "working") {
      return null;
    } else {
      return await this.prisma.operation_logs.update({ where: { id: id }, data: { status: "canceled" } });
    }
  }

  async commitOperation(recordId: number, code: string, runtime: string, runtimeVersion: string, memory = -1) {
    // Get log and operation instance
    const log = await this.prisma.operation_logs.findFirst({ where: { id: recordId, status: "working" } });
    if (log == null) {
      return { Message: "RECORD_NOT_FOUND" };
    }
    const operation = await this.prisma.operations.findUnique({ where: { id: log.operation } });
    const user = await this.prisma.users.findUnique({ where: { id: log.uid } });

    // Deduct energy resource
    if (!(await this.backpacksService.checkMaterialToBackpack(user.backpack_id, { id: "energy", amount: 1 }))) {
      return null;
    } else {
      await this.backpacksService.deleteMaterialToBackpack(user.backpack_id, { id: "energy", amount: 1 });
    }

    // Flags
    let isFinished = false;
    const isDuplicated =
      (await this.prisma.operation_logs.count({ where: { uid: log.uid, status: "finished" } })) !== 0;
    const mark = [];
    const result = [];

    // Foreach the Judgement
    for (const judge of operation.judgement as Array<object>) {
      const response = await axios
        .create({ validateStatus: () => true })
        .post(process.env.RUNTIME_URL + "/api/v2/execute", {
          language: runtime,
          version: runtimeVersion,
          files: [{ content: code }],
          stdin: judge["stdin"] ? judge["stdin"] : "",
          args: judge["args"] ? judge["args"] : [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: memory,
        });
      if (response.status === 200) {
        // Judgement the answer
        const stdout = response.data.run["stdout"];
        isFinished = (stdout.endsWith("\n") ? stdout.slice(0, stdout.length - 1) : stdout) === judge["stdout"];
        // Update flags
        mark.push(isFinished);
        result.push(response.data);
        if (!isFinished) {
          break;
        }
      } else {
        return { Message: "RUNTIME_NOT_AVAILABLE" };
      }
    }

    // Update to database
    await this.prisma.$transaction([
      this.prisma.operation_logs.update({
        where: { id: recordId },
        data: {
          status: isFinished ? "finished" : "working",
          in_progress: !isDuplicated,
        },
      }),
      this.prisma.operation_commits.create({
        data: {
          uid: user.id,
          operation_log: log.id,
          code: code,
          data: {
            finished: isFinished,
            marks: mark,
            result: result,
          },
        },
      }),
    ]);

    return {
      Failed: !isFinished,
      Finished: isFinished,
      InProgress: !isDuplicated,
      Rewards: operation.rewards as Array<any>,
      Mark: mark,
      Result: result,
    };
  }
}
