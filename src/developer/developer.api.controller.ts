import { Body, Controller, HttpCode, Put, Request, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authorization/guards/jwt.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/guards/permissions.decorator';
import { authorization_clients as ClientModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeveloperService } from './developer.service';

@Controller('/api/management/developer')
export class DeveloperApiController {
  constructor(private prisma: PrismaService, private developerService: DeveloperService) {
  }


  @Put('/client')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('oauth-client management')
  async registerClient(@Body() client: ClientModel, @Request() request, @Res() response: any) {
    const developer = await this.prisma.users.findUnique({where: {id: request.user.id}});
    const data = await this.developerService.register_client(developer, client);

    return response.send({
      statusCode: 201,
      message: 'Client registered successfully',
      client: data,
    });
  }
}
