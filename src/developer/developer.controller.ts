import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
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

  @Put('/client')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('oauth-client management')
  async register_client(
    @Body() client: ClientModel,
    @Request() request,
    @Res() response: any,
  ) {
    for (const scope in client.scope.split(',')) {
      if (!ScopeInformation.scopes.includes(scope)) {
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
