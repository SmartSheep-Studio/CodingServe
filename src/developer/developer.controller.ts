import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Delete,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authorization/guards/jwt.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/guards/permissions.decorator';
import { authorization_clients as ClientModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeveloperService } from './developer.service';
import ScopeInformation from './scope.enum';
import { Scopes } from 'src/authorization/guards/scope.decorator';
import { ScopeGuard } from '../authorization/guards/scope.guard';

@Controller('/management/developer')
export class DeveloperController {
  constructor(
    private prisma: PrismaService,
    private developerService: DeveloperService,
  ) {}

  @Post('/signup')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async register_developer(@Request() request) {
    try {
      await this.developerService.signup_developer(request.user);
      return {
        statusCode: 201,
        message: 'Developer registered successfully',
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
        error: 'DataError',
      };
    }
  }

  @Get('/client')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions('oauth-client management')
  @Scopes('read:developer')
  async get_clients(@Request() request, @Query() data: any) {
    if (data['id']) {
      const client = await this.prisma.authorization_clients.findUnique({
        where: { id: data['id'] },
      });
      const granted_users = await this.prisma.authorization_refresh_codes.count(
        { where: { client_id: client.client_id } },
      );
      return {
        statusCode: 200,
        statistics: {
          grantedUsers: granted_users,
        },
        data: client,
      };
    } else {
      const clients = await this.prisma.authorization_clients.findMany({
        where: { developer_id: request.user.id },
        select: {
          client_secret: false,
          id: true,
          client_name: true,
          client_id: true,
          scope: true,
          developer_id: true,
          avatar: true,
          created_at: true,
          updated_at: true,
        },
      });
      let granted_users = 0;
      for (const client of clients) {
        granted_users += await this.prisma.authorization_refresh_codes.count({
          where: { client_id: client.client_id },
        });
      }
      return {
        statusCode: 200,
        statistics: {
          grantedUsers: granted_users,
        },
        data: clients,
      };
    }
  }

  @Delete('/client')
  @HttpCode(202)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions('oauth-client management')
  @Scopes('remove:developer')
  async delete_client(@Query() data: any, @Res() response) {
    if (!data['id']) {
      return response.status(400).send({
        statusCode: '400',
        message: 'ID is required',
        error: 'DataError',
      });
    }
    const client = await this.prisma.authorization_clients.findUnique({
      where: { client_id: data['id'] },
    });
    if (!client) {
      return response.status(400).send({
        statusCode: '400',
        message: 'Cannot found client',
        error: 'DataError',
      });
    }

    // Delete associated codes
    await this.prisma.authorization_codes.deleteMany({
      where: { client_id: client.client_id },
    });
    await this.prisma.authorization_refresh_codes.deleteMany({
      where: { client_id: client.client_id },
    });

    // Delete client
    await this.prisma.authorization_clients.delete({
      where: { client_id: data['id'] },
    });
    return response.send({
      statusCode: 202,
      message:
        'Client deleted successfully, all associated codes is deleted too',
    });
  }

  @Put('/client')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions('oauth-client management')
  @Scopes('write:developer')
  async register_client(
    @Body() client: ClientModel,
    @Request() request,
    @Res() response: any,
  ) {
    if (client.scope == null) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Scope is invalid',
        error: 'DataError',
      });
    }

    // Unique scopes
    client.scope = Array.from(new Set(client.scope.split(','))).join(',');

    if (client.scope.split(',').length > 1) {
      for (const scope of client.scope.split(',')) {
        if (!ScopeInformation.scopes.includes(scope)) {
          return response.status(400).send({
            statusCode: 400,
            message: 'Scope is invalid',
            error: 'DataError',
          });
        }
      }
    } else {
      if (!ScopeInformation.scopes.includes(client.scope)) {
        return response.status(400).send({
          statusCode: 400,
          message: 'Scope is invalid',
          error: 'DataError',
        });
      }
    }
    const developer = await this.prisma.users.findUnique({
      where: { id: request.user.id },
    });
    const data = await this.developerService.register_client(developer, client);
    return response.send({
      statusCode: 201,
      message: 'Client registered successfully',
      client: data,
    });
  }

  @Get('/scopes')
  @HttpCode(200)
  async get_scope_information() {
    return {
      statusCode: 200,
      data: {
        details: ScopeInformation.details,
        available: ScopeInformation.scopes,
      },
    };
  }
}
