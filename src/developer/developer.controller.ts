import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
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
import DeveloperAgreement from './developer.agreement';
import { Scopes } from 'src/authorization/guards/scope.decorator';
import { ScopeGuard } from '../authorization/guards/scope.guard';

@Controller('/management/developer')
export class DeveloperController {
  constructor(
    private prisma: PrismaService,
    private developerService: DeveloperService,
  ) {}

  @Get('/agreement')
  async get_developer_agreement() {
    return {
      statusCode: 200,
      agreement: DeveloperAgreement,
    };
  }

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
      return {
        statusCode: 200,
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
      return {
        statusCode: 200,
        data: clients,
      };
    }
  }

  @Put('/client')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions('oauth-client management')
  @Scopes('new:developer')
  async register_client(
    @Body() client: ClientModel,
    @Request() request,
    @Res() response: any,
  ) {
    if (client.scope.split(',').length !== 1) {
      for (const scope in client.scope.split(',')) {
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
