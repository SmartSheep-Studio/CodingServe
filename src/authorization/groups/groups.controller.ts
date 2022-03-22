import { Body, Controller, Delete, Get, HttpCode, Patch, Put, Res, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../guards/permissions.decorator';
import { groups as GroupModel } from '@prisma/client';

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group select')
  async get_user(id: number) {
    const data = await this.prisma.groups.findUnique({ where: { id: id } });
    return {
      statusCode: 200,
      message: 'Successful deleted',
      data: data,
    };
  }

  @Put()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group create')
  async create_user(@Body() group: GroupModel, @Res() response) {
    if (await this.prisma.groups.findUnique({ where: { id: group.id } }) != null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Username is duplicated.',
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
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group update')
  async update_user(@Body() group: GroupModel, @Res() response) {
    group.update_at = new Date();
    const data = await this.prisma.groups.update({ where: { id: group.id }, data: group });
    delete data['password'];
    return response.send({
      statusCode: 200,
      message: 'Successful updated',
      data: data,
    });
  }

  @Delete()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('group delete')
  async delete_user(id: number) {
    await this.prisma.users.updateMany({ where: { group_id: id }, data: { group_id: 0 } });
    await this.prisma.groups.delete({ where: { id: id } });
    return {
      statusCode: 200,
      message: 'Successful deleted',
    };
  }
}
