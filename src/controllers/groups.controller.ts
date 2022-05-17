import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Put,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { groups as GroupModel } from '@prisma/client';

@Controller('/management/groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async get_user_group(@Request() request) {
    if (request.user.group_id == 0) {
      return {
        statusCode: 200,
        message: 'Successful selected',
        data: null,
      };
    }
    const data = await this.prisma.groups.findUnique({
      where: { id: request.user.group_id },
    });
    return {
      statusCode: 200,
      message: 'Successful selected',
      data: data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async get_group(@Body() body: object) {
    const data = await this.prisma.groups.findUnique({
      where: { id: body['id'] },
    });
    return {
      statusCode: 200,
      message: 'Successful selected',
      data: data,
    };
  }

  @Put()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group create')
  async create_group(@Body() group: GroupModel, @Res() response) {
    if (
      (await this.prisma.groups.findUnique({ where: { name: group.name } })) !=
      null
    ) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Group name is duplicated.',
        error: 'DataError',
      });
    }

    const data = await this.prisma.groups.create({ data: group });
    return response.send({
      statusCode: 201,
      message: 'Successful created',
      data: data,
    });
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group update')
  async update_group(@Body() group: GroupModel, @Res() response) {
    group.update_at = new Date();
    const data = await this.prisma.groups.update({
      where: { id: group.id },
      data: group,
    });
    delete data['password'];
    return response.send({
      statusCode: 200,
      message: 'Successful updated',
      data: data,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group delete')
  async delete_group(id: number) {
    await this.prisma.users.updateMany({
      where: { group_id: id },
      data: { group_id: 0 },
    });
    await this.prisma.groups.delete({ where: { id: id } });
    return {
      statusCode: 200,
      message: 'Successful deleted',
    };
  }
}
