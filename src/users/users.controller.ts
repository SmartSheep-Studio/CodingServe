import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  HttpCode,
  Patch,
  Put,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtAuthGuard } from '../authorization/guards/jwt.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/guards/permissions.decorator';
import { users as UserModel } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

@Controller('/management/users')
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private mailerSerivce: MailerService,
    private userService: UsersService,
  ) {}

  /**
   * Different by "User create" function, this function is use to signup,
   * it require a email, username, and password, then will send a code to verify your email.
   * Next time request just need give verify code to register.
   * @param id
   * @returns
   */
  @Post()
  @HttpCode(201)
  async signup(
    @Body() user: UserModel,
    @Query() verify: object,
    @Res() response,
  ) {
    if (verify['verify']) {
      const code = verify['verify'];
      try {
        if (await this.userService.activeUser(code)) {
          return response.status(200).send({
            statusCode: 200,
            message: 'Verify successful',
          });
        } else {
          return response.status(400).send({
            statusCode: 400,
            message: 'Verify code is invalid',
            error: 'DataError',
          });
        }
      } catch (e) {
        return response.status(400).send({
          statusCode: 400,
          message: 'Failed to verify, database error, message: ' + e.message,
          error: 'ServerError',
        });
      }
    }

    try {
      user.id = uuidv4();
      let willRemove = await this.prisma.users.findUnique({
        where: { username: user.username },
      });
      if (willRemove != null && willRemove.email !== user.email) {
        willRemove = null;
      }
      if (willRemove != null && willRemove.is_active == false) {
        await this.prisma.users.delete({ where: { id: willRemove.id } });
        await this.prisma.verify_codes.deleteMany({
          where: { uid: willRemove.id },
        });
      }
      if (
        !willRemove &&
        (await this.prisma.users.findUnique({
          where: { username: user.username },
        })) != null
      ) {
        return response.status(400).send({
          statusCode: 400,
          message: 'Username is duplicated',
          error: 'DataError#1',
        });
      }
      if (!willRemove) {
        const already = await this.prisma.users.findUnique({
          where: { username: user.email },
        });
        if (already != null) {
          delete already['password'];
          return response.status(400).send({
            statusCode: 400,
            message: 'Email is used, maybe you already have an account',
            error: 'DataError#2',
            data: already,
          });
        }
      }
      const data = await this.userService.createUser(user);
      await this.prisma.verify_codes.deleteMany({ where: { uid: data.id } });
      const verifyCode = await this.prisma.verify_codes.create({
        data: {
          id: uuidv4(),
          uid: data.id,
          code: uuidv4().toUpperCase().slice(0, 6),
        },
      });
      delete data['password'];
      this.mailerSerivce
        .sendMail({
          to: data.email,
          subject: 'Verify your SmartSheep universal account',
          template: 'verify',
          context: {
            user: data,
            code: verifyCode.code,
          },
        })
        .then(() => {
          return response.send({
            statusCode: 201,
            message: 'Successful sign up, verify email sent',
            data: data,
          });
        })
        .catch((error) => {
          return response.status(500).send({
            statusCode: 500,
            message: 'Failed to send email, message: ' + error.message,
            error: 'ServerError#2',
          });
        });
    } catch (e) {
      return response.status(500).send({
        statusCode: 500,
        message: 'Failed to sign up, database error, message: ' + e.message,
        error: 'ServerError#1',
      });
    }
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
    if ((await this.userService.getUserByUsername(user.username)) != null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Username is duplicated.',
        error: 'DataError',
      });
    }
    if (typeof user.group_id !== 'number') {
      user.group_id = 0;
    }
    if (
      user.group_id !== 0 &&
      (await this.prisma.groups.findUnique({ where: { id: user.group_id } })) ==
        null
    ) {
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
    if (
      user.group_id !== 0 &&
      (await this.prisma.groups.findUnique({ where: { id: user.group_id } })) ==
        null
    ) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Provided group_id is invalid.',
        error: 'DataError',
      });
    }

    user.update_at = new Date();
    const data = await this.prisma.users.update({
      where: { id: user.id },
      data: user,
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
  @Permissions('user delete')
  async delete_user(id: string) {
    await this.prisma.users.delete({ where: { id: id } });
    return {
      statusCode: 200,
      message: 'Successful deleted',
    };
  }
}
