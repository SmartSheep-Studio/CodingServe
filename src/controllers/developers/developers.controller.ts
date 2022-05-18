import { Body, Controller, Get, HttpCode, Post, Put, Delete, Query, Request, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../guards/jwt.guardard";
import { PermissionsGuard } from "../../decorators/permissions.guardard";
import { Permissions } from "../../decorators/permissions.decoratortor";
import { developer_clients as ClientModel } from "@prisma/client";
import { PrismaService } from "../../services/prisma.serviceice";
import { DeveloperService } from "../../services/developers.serviceice";
import ScopeInformation from "../../enums/scope.enumnum";
import { Scopes } from "../../decorators/scope.decoratortor";
import { ScopeGuard } from "../../decorators/scope.guardard";

@Controller("/management/developer")
export class DeveloperController {
  constructor(private prisma: PrismaService, private developerService: DeveloperService) {}

  @Post("/signup")
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async register_developer(@Request() request) {
    try {
      await this.developerService.signup_developer(request.user);
      return {
        statusCode: 201,
        message: "Developer registered successfully",
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
        error: "DataError",
      };
    }
  }

  @Get("/client")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions("oauth-client management")
  @Scopes("read:developer")
  async get_clients(@Request() request, @Query() data: any) {
    if (data["id"]) {
      const client = await this.prisma.developer_clients.findUnique({
        where: { id: data["id"] },
      });
      const granted_users = await this.prisma.developer_clients.count({
        where: { client_id: client.client_id },
      });
      return {
        statusCode: 200,
        statistics: {
          grantedUsers: granted_users,
        },
        data: client,
      };
    } else {
      const clients = await this.prisma.developer_clients.findMany({
        where: { developer_id: request.user.id },
        select: {
          client_secret: false,
          id: true,
          name: true,
          client_id: true,
          scopes: true,
          developer_id: true,
          icon: true,
          created_at: true,
          updated_at: true,
        },
      });
      const statistics = {
        granted: 0,
      };
      for (const client of clients) {
        statistics.granted += await this.prisma.user_tokens.count({
          where: { issuer_id: client.client_id, type: "refresh" },
        });
      }
      return {
        Status: {
          Code: "OK",
          Message: "Successfully fetch developer information.",
        },
        Response: {
          Statistics: statistics,
          Clients: clients,
        },
      };
    }
  }

  @Delete("/client")
  @HttpCode(202)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions("oauth-client management")
  @Scopes("remove:developer")
  async delete_client(@Query() data: any, @Res() response) {
    if (!data["id"]) {
      return response.status(400).send({
        statusCode: "400",
        message: "ID is required",
        error: "DataError",
      });
    }
    const client = await this.prisma.developer_clients.findUnique({
      where: { client_id: data["id"] },
    });
    if (!client) {
      return response.status(400).send({
        statusCode: "400",
        message: "Cannot found client",
        error: "DataError",
      });
    }

    // Delete associated codes
    await this.prisma.developer_clients.deleteMany({
      where: { client_id: client.client_id },
    });
    await this.prisma.user_tokens.deleteMany({
      where: { issuer_id: client.client_id, type: "refresh" },
    });

    // Delete client
    await this.prisma.developer_clients.delete({
      where: { client_id: data["id"] },
    });
    return response.send({
      statusCode: 202,
      message: "Client deleted successfully, all associated codes is deleted too",
    });
  }

  @Put("/client")
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard, ScopeGuard)
  @Permissions("oauth-client management")
  @Scopes("write:developer")
  async register_client(@Body() client: ClientModel, @Request() request, @Res() response: any) {
    if (client.scopes == null) {
      return response.status(400).send({
        statusCode: 400,
        message: "Scope is invalid",
        error: "DataError",
      });
    }

    const scopes = client.scopes as Array<string>;
    for (const scope of scopes) {
      if (!ScopeInformation.scopes.includes(scope)) {
        return response.status(400).send({
          statusCode: 400,
          message: "Scope is invalid",
          error: "DataError",
        });
      }
    }
    const developer = await this.prisma.users.findUnique({
      where: { id: request.user.id },
    });
    const data = await this.developerService.register_client(developer, client);
    return response.send({
      statusCode: 201,
      message: "Client registered successfully",
      client: data,
    });
  }

  @Get("/scopes")
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
