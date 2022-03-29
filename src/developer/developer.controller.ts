import {
  Body,
  Controller,
  Get,
  HttpCode,
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

@Controller('/management/developer')
export class DeveloperController {
  constructor(
    private prisma: PrismaService,
    private developerService: DeveloperService,
  ) {}

  @Put('/client')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('oauth-client management')
  async registerClient(
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
  async getScopeInformation() {
    return {
      statusCode: 200,
      data: {
        details: ScopeInformation.details,
        available: ScopeInformation.scopes,
      },
    };
  }
}
