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
  @Render('oauth/signin')
  async signin(@Query() query: object) {
    console.log(query);
    if (query['credentials']) {
      return { credentials: query['credentials'] };
    }
    if (query['response_type'] !== 'token') {
      return { error: 'Unsupported response/grant type (AU#C400)' };
    }
    if (!query['redirect_uri']) {
      return { error: 'Unkown redirect uri (AU#CR04)' };
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
  async check_credentials(@Body() data: object, @Res() res) {
    const user = await this.usersService.getUserByUsername(data['username']);
    if (!user || !await bcrypt.compare(data['password'], user.password)) {
      return res.redirect('/authenticate/oauth?credentials=' + encodeURIComponent('Invailed credentials (AU#CR04)'));
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
    return res.redirect('/authenticate/oauth/grant' + '?code=' + token + '&redirect_uri=' + encodeURIComponent(data['redirect_uri']));
  }

  @Get('grant')
  @Render('oauth/authenticate')
  async authorization(@Query() query: object) {
    if (!query['redirect_uri']) {
      return { error: 'Unkown redirect uri (AU#CR04)' };
    }
    if (!query['code'] || !this.jwtService.verify(query['code'])) {
      return { error: 'Invaild authorization code (AAU#CA50)' };
    }
    const token = await this.prisma.authorization_codes.findUnique({ where: { code: query['code'] } });
    if (!token) {
      return { error: 'Invaild auhtorization code (AU#CA50)' };
    }
    const user = await this.prisma.users.findUnique({ where: { id: token['uid'] } });
    const client = await this.prisma.authorization_clients.findUnique({ where: { client_id: token['client_id'] } });
    const developer = await this.prisma.users.findUnique({ where: { id: client['developer_id'] } });
    return {
      redirect_uri: query['redirect_uri'],
      token: token.code,
      client: client,
      developer: developer,
      user: user
    };
  }

  @Get('granted')
  async grant_access(@Query() query: object, @Res() response) {
    if (!query['redirect_uri']) {
      return { message: 'Unkown redirect uri (AU#CR04)', error: 'DataError' };
    }
    if (!query['code'] || !this.jwtService.verify(query['code'])) {
      return { message: 'Invaild authorization code (AU#CA50)', error: 'DataError' };
    }
    const token = await this.prisma.authorization_codes.findUnique({ where: { code: query['code'] } });
    if (!token) {
      return { message: 'Invaild auhtorization code (AU#CA50)', error: 'DataError' };
    }
    const user = await this.prisma.users.findUnique({ where: { id: token['uid'] } });
    await this.prisma.authorization_codes.deleteMany({ where: { uid: user.id } });
    const accessToken = this.jwtService.sign({username: user.username, uid: user.id}, {expiresIn: '30d'});
    return response.redirect(`${query['redirect_uri']}?access_token=${accessToken}&token_type=bearer&expires_in=${30 * 24 * 60 * 60}&state=${query['state']}`);
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
