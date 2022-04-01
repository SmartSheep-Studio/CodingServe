import { JwtAuthGuard } from './../guards/jwt.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { AuthorizationService } from '../authorization.service';

@Controller('oauth')
export class OauthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private authorzationService: AuthorizationService,
  ) {}

  @Get()
  async signin(@Query() query: object, @Res() response) {
    if (query['response_type'] !== 'code') {
      return response
        .status(400)
        .send({ error: 'Unsupported response/grant type (AU#C400)' });
    }
    const client = await this.prisma.authorization_clients.findUnique({
      where: { client_id: query['client_id'] },
    });
    if (!client) {
      return response.status(400).send({ error: 'Client not found (AU#C404)' });
    }
    const developer = await this.prisma.users.findUnique({
      where: { id: client['developer_id'] },
    });
    return response.send({
      redirect_uri: query['redirect_uri'],
      client: client,
      developer: developer,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async summon_authorization_code(
    @Body() data: object,
    @Res() response,
    @Request() request,
  ) {
    if (!data['client_id']) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Missing client_id (AU#C400)',
        error: 'DataError',
      });
    }
    if (
      !(await this.prisma.authorization_clients.findUnique({
        where: { client_id: data['client_id'] },
      }))
    ) {
      return response.status(400).send({
        statusCode: 400,
        message: 'Client not found (AU#C404)',
        error: 'DataError',
      });
    }
    const user = request.user;
    const token = this.jwtService.sign({ uid: user.id, code: uuidv4() });
    await this.prisma.authorization_codes.deleteMany({
      where: { uid: user.id },
    });
    await this.prisma.authorization_codes.create({
      data: {
        id: uuidv4(),
        code: token,
        uid: user.id,
        client_id: data['client_id'],
      },
    });
    return response.status(200).send({
      statusCode: 200,
      message: 'Authorization code generated, grant access successfully',
      code: token,
    });
  }

  @Post('grant')
  async grant_access(@Body() data: object) {
    if (
      !data['grant_type'] ||
      (data['grant_type'] !== 'authorization_code' &&
        data['grant_type'] !== 'refresh_token')
    ) {
      return { error: 'Unsupported grant type (AU#C400)' };
    }
    let token, user;
    if (data['grant_type'] === 'refresh_token') {
      if (
        !data['refresh_token'] ||
        !this.jwtService.verify(data['refresh_token'])
      ) {
        return {
          message: 'Invaild refresh token (AU#CA50)',
          error: 'DataError',
        };
      }
      token = await this.prisma.authorization_refresh_codes.findUnique({
        where: { code: data['refresh_token'] },
      });
      if (!token) {
        return {
          message: 'Invaild auhtorization code (AU#CA50)',
          error: 'DataError',
        };
      }
      user = await this.prisma.users.findUnique({
        where: { id: token['uid'] },
      });
      await this.prisma.authorization_refresh_codes.delete({
        where: { code: data['refresh_token'] },
      });
    }
    if (data['grant_type'] === 'authorization_code') {
      if (!data['code'] || !this.jwtService.verify(data['code'])) {
        return {
          message: 'Invaild authorization code (AU#CA50)',
          error: 'DataError',
        };
      }
      token = await this.prisma.authorization_codes.findUnique({
        where: { code: data['code'] },
      });
      if (!token) {
        return {
          message: 'Invaild auhtorization code (AU#CA50)',
          error: 'DataError',
        };
      }
      user = await this.prisma.users.findUnique({
        where: { id: token['uid'] },
      });
      await this.prisma.authorization_codes.deleteMany({
        where: { uid: user.id },
      });
    }
    const client = await this.prisma.authorization_clients.findUnique({
      where: { client_id: token['client_id'] },
    });
    const refreshCode = this.jwtService.sign(
      { uid: user.id, code: uuidv4() },
      { expiresIn: '10y' },
    );
    await this.prisma.authorization_refresh_codes.create({
      data: {
        id: uuidv4(),
        code: refreshCode,
        uid: user.id,
        client_id: token['client_id'],
      },
    });
    const accessToken = await this.authorzationService.signClientJWT(
      client,
      user,
    );
    return {
      access_token: accessToken.token,
      refresh_token: refreshCode,
      expires_in: 30 * 24 * 60 * 60,
      token_type: 'Bearer',
    };
  }
}
