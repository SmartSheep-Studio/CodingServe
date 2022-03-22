import * as bcrypt from 'bcrypt';
import { Body, Controller, Get, HttpCode, Post, Put, Query, Render, Request, Res, UseGuards } from '@nestjs/common';
import { authorization_clients as ClientModel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../guards/permissions.decorator';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('authenticate/oauth')
export class OauthController {
  constructor(private prisma: PrismaService, private usersService: UsersService, private jwtService: JwtService) {
  }

  @Get()
  @Render('oauth/authenticate')
  async signin(@Query() query: object) {
    if (query['credentials']) {
      return { credentials: query['credentials'] };
    }
    if (query['response_type'] !== 'code') {
      return { error: 'Unsupported response/grant type (AU#C400)' };
    }
    const client = await this.prisma.authorization_clients.findUnique({ where: { client_id: query['client_id'] } });
    if (!client) {
      return { error: 'Client not found (AU#C404)' };
    }
    const developer = await this.prisma.users.findUnique({ where: { id: client['developer_id'] } });
    return {
      redirect_uri: query['redirect_uri'],
      client: client,
      developer: developer,
    };
  }

  @Post()
  async check_credentials(@Body() data: object, @Res() response) {
    const user = await this.usersService.getUserByUsername(data['username']);
    if (!user || !await bcrypt.compare(data['password'], user.password)) {
      return response.redirect('/authenticate/oauth?credentials=' + encodeURIComponent('Invailed credentials (AU#CR04)'));
    }
    const token = this.jwtService.sign({ uid: user.id, code: uuidv4() });
    await this.prisma.authorization_codes.deleteMany({ where: { uid: user.id } });
    await this.prisma.authorization_codes.create({
      data: {
        id: uuidv4(),
        code: token,
        uid: user.id,
        client_id: data['client_id'],
      },
    });
    return response.redirect(data['redirect_uri'] + '?code=' + token);
  }

  @Post('grant')
  async authorization(@Body() data: object) {
    if (!data['grant_type'] || (data['grant_type'] !== 'authorization_code' && data['grant_type'] !== 'refresh_token')) {
      return { error: 'Unsupported grant type (AU#C400)' };
    }
    let token, user;
    if (data['grant_type'] === 'refresh_token') {
      if (!data['refresh_token'] || !this.jwtService.verify(data['refresh_token'])) {
        return { message: 'Invaild refresh token (AU#CA50)', error: 'DataError' };
      }
      token = await this.prisma.authorization_refresh_codes.findUnique({ where: { code: data['refresh_token'] } });
      if (!token) {
        return { message: 'Invaild auhtorization code (AU#CA50)', error: 'DataError' };
      }
      user = await this.prisma.users.findUnique({ where: { id: token['uid'] } });
      await this.prisma.authorization_refresh_codes.delete({ where: { code: data['refresh_token'] } });
    }
    if (data['grant_type'] === 'authorization_code') {
      if (!data['code'] || !this.jwtService.verify(data['code'])) {
        return { message: 'Invaild authorization code (AU#CA50)', error: 'DataError' };
      }
      token = await this.prisma.authorization_codes.findUnique({ where: { code: data['code'] } });
      if (!token) {
        return { message: 'Invaild auhtorization code (AU#CA50)', error: 'DataError' };
      }
      user = await this.prisma.users.findUnique({ where: { id: token['uid'] } });
      await this.prisma.authorization_codes.deleteMany({ where: { uid: user.id } });
    }
    const refreshCode = this.jwtService.sign({ uid: user.id, code: uuidv4() }, { expiresIn: '10y' });
    await this.prisma.authorization_refresh_codes.create({
      data: {
        id: uuidv4(),
        code: refreshCode,
        uid: user.id,
        client_id: token['client_id'],
      },
    });
    const accessToken = this.jwtService.sign({ username: user.username, uid: user.id }, { expiresIn: '30d' });
    return {
      access_token: accessToken,
      refresh_token: refreshCode,
      expires_in: 30 * 24 * 60 * 60,
      token_type: 'Bearer',
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
