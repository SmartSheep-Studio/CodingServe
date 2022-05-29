import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { v4 as uuidv4 } from "uuid";
import { operations as OperationModel, records_operation as RecordOperationModel } from "@prisma/client";
import { BackpacksService } from "./backpacks.service";
import axios from "axios";

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService, private readonly backpacksService: BackpacksService) {}

  async createNewOperation(
    data: object,
    conditions: object,
    rewards: Array<object>,
    costs: Array<object>,
    publisher: string,
    id?: string,
  ) {
    return await this.prisma.operations.create({
      data: {
        id: id ? id : uuidv4(),
        data: data,
        conditions: conditions,
        publisher: publisher,
        rewards: rewards,
        costs: costs,
      },
    });
  }

  async getOperationDetail(
    uid: string,
    id: string,
  ): Promise<{ operation: OperationModel; records: RecordOperationModel[] }> {
    const operation = await this.prisma.operations.findFirst({ where: { id: id, status: "published" } });
    const records = await this.prisma.records_operation.findMany({ where: { uid: uid, operation: id } });
    return { operation, records };
  }

  async startOperation(uid: string, id: string) {
    const user = await this.prisma.users.findUnique({ where: { id: uid } });
    const operation = await this.prisma.operations.findUnique({ where: { id: id } });
    const progress = await this.prisma.records_operation.count({
      where: { uid: user.id, status: "finished", in_progress: true },
    });

    if (user.level < operation.conditions["level"]) {
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
        this.prisma.records_operation.create({
          data: { uid: user.id, operation: operation.id, data: [], status: "working" },
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
    const record = await this.prisma.records_operation.findFirst({ where: { uid: uid, id: id, status: "working" } });
    if (record == null) {
      return record;
    } else {
      return await this.prisma.records_operation.update({ where: { id: id }, data: { status: "canceled" } });
    }
  }

  async commitOperation(recordId: number, code: string, runtime: string, runtimeVersion: string, memory = -1) {
    // Get record and operation instance
    const record = await this.prisma.records_operation.findFirst({ where: { id: recordId, status: "working" } });
    if (record == null) {
      return { Message: "RECORD_NOT_FOUND" };
    } else {
      memory = record.data["memory"] ? record.data["memory"] : memory;
    }
    const operation = await this.prisma.operations.findUnique({ where: { id: record.operation } });

    // Flags
    let isFinished = false;
    const isDuplicated =
      (await this.prisma.records_operation.count({ where: { uid: record.uid, status: "finished" } })) !== 0;
    const mark = [];
    const result = [];

    // Foreach Judgement
    for (const judge of operation.data["judgement"]) {
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
    await this.prisma.records_operation.update({
      where: { id: recordId },
      data: {
        data: (record.data as Array<object>).concat({
          mark: mark,
          result: result,
          code: code,
        }),
        status: isFinished ? "finished" : "working",
        in_progress: !isDuplicated,
      },
    });

    return {
      Failed: !isFinished,
      Finished: isFinished,
      Rewards: operation.rewards as Array<any>,
      Mark: mark,
      Result: result,
    };
  }
}
