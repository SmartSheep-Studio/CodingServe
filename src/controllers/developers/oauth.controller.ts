import { JwtAuthGuard } from "../../guards/jwt.guard";
import { Body, Controller, Get, Post, Query, Res, UseGuards, Request } from "@nestjs/common";
import { PrismaService } from "../../services/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { JwtService } from "@nestjs/jwt";
import { AuthorizationService } from "../../services/authorization.service";
import * as bcrpyt from "bcrypt";

@Controller("oauth")
export class OauthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private authorizationService: AuthorizationService,
  ) {}

  @Get()
  async signin(@Query() query: object, @Res() response) {
    if (query["response_type"] !== "code") {
      return response.status(400).send({ error: "Unsupported response/grant type (AU#C400)" });
    }
    const client = await this.prisma.developer_clients.findUnique({
      where: { client_id: query["client_id"] },
    });
    if (!client) {
      return response.status(400).send({ error: "Client not found (AU#C404)" });
    }
    const developer = await this.prisma.users.findUnique({
      where: { id: client["developer_id"] },
    });
    return response.send({
      redirect_uri: query["redirect_uri"],
      client: client,
      developer: developer,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async summon_authorization_code(@Body() data: object, @Res() response, @Request() request) {
    if (!data["client_id"]) {
      return response.status(400).send({
        statusCode: 400,
        message: "Missing client_id (AU#C400)",
        error: "DataError",
      });
    }
    if (
      !(await this.prisma.developer_clients.findUnique({
        where: { client_id: data["client_id"] },
      }))
    ) {
      return response.status(400).send({
        statusCode: 400,
        message: "Client not found (AU#C404)",
        error: "DataError",
      });
    }
    const user = request.user;
    const token = this.jwtService.sign({ uid: user.id, code: uuidv4() });
    await this.prisma.user_tokens.deleteMany({
      where: { issuer_id: user.id, type: "access" },
    });
    await this.prisma.user_tokens.create({
      data: {
        id: uuidv4(),
        token: token,
        issuer_id: data["client_id"],
        type: "access",
      },
    });
    return response.status(200).send({
      statusCode: 200,
      message: "Authorization code generated, grant access successfully",
      code: token,
    });
  }

  @Post("grant")
  async grant_access(@Body() data: object, @Res() response) {
    if (
      !data["grant_type"] ||
      (data["grant_type"] !== "authorization_code" && data["grant_type"] !== "refresh_token")
    ) {
      return response.status(400).send({ error: "Unsupported grant type (AU#C400)" });
    }
    let token, user, client;
    if (data["grant_type"] === "refresh_token") {
      if (!data["refresh_token"] || !this.jwtService.verify(data["refresh_token"])) {
        return {
          message: "Invalid refresh token (AU#CA50)",
          error: "DataError",
        };
      }
      token = await this.prisma.user_tokens.findUnique({
        where: { token: data["refresh_token"] },
      });
      if (!token) {
        return {
          message: "Invalid authorization code (AU#CA50)",
          error: "DataError",
        };
      }
      client = await this.prisma.developer_clients.findUnique({
        where: { client_id: token["client_id"] },
      });
      user = await this.prisma.users.findUnique({
        where: { id: token["uid"] },
      });
      await this.prisma.user_tokens.delete({
        where: { token: data["refresh_token"] },
      });
    }
    if (data["grant_type"] === "authorization_code") {
      if (!data["code"] || !this.jwtService.verify(data["code"])) {
        return response.status(400).send({
          message: "Invalid authorization code (AU#CA50)",
          error: "DataError",
        });
      }
      token = await this.prisma.user_tokens.findUnique({
        where: { token: data["code"] },
      });
      if (!token) {
        return response.status(400).send({
          message: "Invalid authorization code (AU#CA50)",
          error: "DataError",
        });
      }
      client = await this.prisma.developer_clients.findUnique({
        where: { client_id: token["client_id"] },
      });
      if (!(await bcrpyt.compare(data["client_secret"], client.client_secret))) {
        return response.status(400).send({
          message: "Invalid client secret (AU#CA51)",
          error: "DataError",
        });
      }
      user = await this.prisma.users.findUnique({
        where: { id: token["uid"] },
      });
      await this.prisma.user_tokens.deleteMany({
        where: { issuer_id: user.id, type: "access" },
      });
    }
    const refreshCode = this.jwtService.sign({ uid: user.id, code: uuidv4() }, { expiresIn: "10y" });
    await this.prisma.user_tokens.create({
      data: {
        id: uuidv4(),
        token: refreshCode,
        issuer_id: token["client_id"],
        type: "refresh",
      },
    });
    const accessToken = await this.authorizationService.signClientJWT(client, user);
    return response.send({
      access_token: accessToken.token,
      refresh_token: refreshCode,
      expires_in: 30 * 24 * 60 * 60,
      token_type: "Bearer",
    });
  }
}
