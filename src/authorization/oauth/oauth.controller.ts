import { Body, Controller, Get, HttpCode, Put, Query, Render, Request, Res, UseGuards } from '@nestjs/common';
import { authorization_clients as ClientModel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../guards/permissions.decorator';

@Controller('authenticate/oauth')
export class OauthController {
  constructor(private prisma: PrismaService) {
  }


  @Get()
  @Render('oauth/signin')
  async authorization(@Query() query: object) {
    if(query['grant_type'] !== 'authorization_code') {
      return { error: 'Unsupported grant type (AU#C400)' };
    }
    const client = await this.prisma.authorization_clients.findUnique({ where: { client_id: query['client_id'] } });
    if (!client) {
      return { error: 'Client not found (AU#C404)' };
    }
    const developer = await this.prisma.users.findUnique({ where: { id: client['developer_id'] } });
    return {
      client: client,
      developer: developer,
    };
  }

  @Put('/registerClient')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('oauth-client register')
  async registerClient(@Body() client: ClientModel, @Request() request, @Res() response: any) {
    client.developer_id = request.user.id;
    client.id = uuidv4();
    client.client_secret = uuidv4().substring(0, 8).toUpperCase();
    client.client_id = uuidv4().substring(0, 8).toUpperCase();
    const data = await this.prisma.authorization_clients.create({ data: client });

    return response.send({
      statusCode: 201,
      message: 'Client registered successfully',
      client: data,
    });
  }
}
