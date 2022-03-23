import { Body, Controller, Delete, Get, HttpCode, Patch, Put, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../guards/permissions.decorator';
import { users as UserModel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

@Controller('/api/management/users')
export class UsersApiController {
  constructor(private prisma: PrismaService, private userService: UsersService) {
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user select')
  async get_user(id: string) {
    const data = await this.prisma.users.findUnique({ where: { id: id } });
    delete data['password'];
    return {
      statusCode: 200,
      message: 'Successful deleted',
      data: data,
    };
  }

  @Put()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user create')
  async create_user(@Body() user: UserModel, @Res() response) {
    if (await this.userService.getUserByUsername(user.username) != null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Username is duplicated.',
        error: 'DataError',
      });
    }
    if (typeof user.group_id !== 'number') {
      user.group_id = 0;
    }
    if (user.group_id !== 0 && await this.prisma.groups.findUnique({ where: { id: user.group_id } }) == null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Provided group_id is invalid.',
        error: 'DataError',
      });
    }

    const data = await this.userService.createUser(user);
    delete data['password'];
    return response.send({
      statusCode: 201,
      message: 'Successful created',
      data: data,
    });
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user update')
  async update_user(@Body() user: UserModel, @Res() response) {
    if (typeof user.group_id !== 'number') {
      user.group_id = 0;
    }
    if (user.group_id !== 0 && await this.prisma.groups.findUnique({ where: { id: user.group_id } }) == null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Provided group_id is invalid.',
        error: 'DataError',
      });
    }

    user.update_at = new Date();
    const data = await this.prisma.users.update({ where: { id: user.id }, data: user });
    delete data['password'];
    return response.send({
      statusCode: 200,
      message: 'Successful updated',
      data: data,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user delete')
  async delete_user(id: string) {
    await this.prisma.users.delete({ where: { id: id } });
    return {
      statusCode: 200,
      message: 'Successful deleted',
    };
  }
}
