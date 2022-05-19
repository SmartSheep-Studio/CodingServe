import { Module } from "@nestjs/common";
import { GroupsController } from "../controllers/groups.controller";

@Module({
  controllers: [GroupsController],
})
export class GroupsModule {}
