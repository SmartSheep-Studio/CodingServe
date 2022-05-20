import { Body, Controller, Delete, Post, HttpCode, Patch, Put, Res, UseGuards, Request, Get, Query } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { PermissionsGuard } from "../decorators/permissions.guard";
import { Permissions } from "../decorators/permissions.decorator";
import { users as UserModel } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../services/prisma.service";
import { UsersService } from "../services/users.service";
import { LocalAuthGuard } from "../guards/local.guard";

@Controller("/security/users")
export class UsersController {
  constructor(private prisma: PrismaService, private mailerService: MailerService, private userService: UsersService) {}

  @Post("/signup")
  @HttpCode(200)
  async signup(@Body() user: UserModel, @Res() response: any) {
    try {
      // Initialize the UUID
      user.id = uuidv4();

      // Check duplicate
      let duplicate: any;
      duplicate = await this.userService.getUserByUsername(user.username);
      if (duplicate != null) {
        return response.status(400).send({
          Status: {
            Code: "DATA_ERROR",
            CodeDetail: "USERNAME_DUPLICATED",
            Message: "Username is duplicated.",
          },
          Response: null,
        });
      }
      duplicate = await this.userService.getUserByEmail(user.email);
      if (duplicate != null) {
        return response.status(400).send({
          Status: {
            Code: "DATA_ERROR",
            CodeDetail: "ALREADY_REGISTED",
            Message: "Your email has been used, check you maybe already registered.",
          },
          Response: duplicate,
        });
      }

      // Create user activation token
      await this.prisma.user_tokens.deleteMany({ where: { issuer_id: user.id } });

      // Insert to database
      const [activeToken, data] = await this.prisma.$transaction([
        this.prisma.user_tokens.create({
          data: {
            id: uuidv4(),
            issuer_id: user.id,
            token: uuidv4().toUpperCase().slice(0, 6),
          },
        }),
        this.userService.createUserSynchronous(user),
      ]);

      // Send mail
      this.mailerService
        .sendMail({
          to: data.email,
          subject: "CodingLand @" + data.username + " | Email Verify",
          template: "activation",
          context: {
            user: data,
            code: activeToken.token,
          },
        })
        .then(() => {
          return response.send({
            Status: {
              Code: "OK",
              Message: "Successfully sign up new account, activation email has been send.",
            },
            Response: null,
          });
        })
        .catch((error) => {
          return response.status(200).send({
            Status: {
              Code: "TRY_AGAIN_LATER",
              CodeDetail: "SMTP_ERROR",
              Message: "Unable to establish connection with SMTP.",
              ErrorDetail: error,
            },
            Response: null,
          });
        });
    } catch (error) {
      return response.status(500).send({
        Status: {
          Code: "DB_ERROR",
          Message: "Unable to update data in databases.",
          ErrorDetail: error,
        },
        Response: null,
      });
    }
  }

  @Post("/active")
  @HttpCode(200)
  async activeUser(@Body() body: object, @Res() response: any) {
    const code = body["code"];
    try {
      if (await this.userService.activeUser(code)) {
        return response.status(200).send({
          Status: {
            Code: "OK",
            Message: "Sucessfully active your account.",
          },
          Response: null,
        });
      } else {
        return response.status(400).send({
          Status: {
            Code: "DATA_ERROR",
            Message: "Your active code is invalid.",
          },
          Response: null,
        });
      }
    } catch (error) {
      return response.status(400).send({
        Status: {
          Code: "UNKNOWN_ERROR_SERVERSIDE",
          Message: "Cannot active your account. It's server-side question.",
          ErrorDetail: error,
        },
        Response: null,
      });
    }
  }

  @Post("/signin")
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async getAccessToken(@Request() request: any) {
    const token = this.userService.signJWT(request.user);
    return {
      Status: {
        Code: "OK",
        Message: "Sign in successfully.",
      },
      Response: token,
    };
  }

  @Get("/profile")
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() request: any, @Query() options: object) {
    if (options["detail"]) {
      const user = await this.prisma.users.findUnique({ where: { id: request.user.id } });
      const group = await this.prisma.user_groups.findUnique({ where: { id: request.user.group_id } });
      const backpack = await this.prisma.backpacks.findUnique({ where: { id: request.user.backpack_id } });
      return {
        Status: {
          Code: "OK",
          Message: "Successfully fetch your detail profile",
        },
        Response: {
          User: user,
          Group: group,
          Backpack: backpack,
        },
      };
    } else {
      return {
        Status: {
          Code: "OK",
          Message: "Successfully fetch your profile",
        },
        Response: request.user,
      };
    }
  }

  @Put()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("users:create")
  async create_user(@Body() user: UserModel, @Res() response: any) {
    if ((await this.userService.getUserByUsername(user.username)) != null) {
      return response.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "USERNAME_DUPLICATED",
          Message: "Username is duplicated.",
        },
        Response: null,
      });
    }
    if (
      user.group_id !== "" &&
      (await this.prisma.user_groups.findUnique({
        where: { id: user.group_id },
      })) == null
    ) {
      return response.status(400).send({
        Status: {
          Code: "DATA_ERROR",
          CodeDetail: "USER_GROUP_NOT_FOUND",
          Message: "Unable found user group with Group ID: " + user.group_id,
        },
        Response: null,
      });
    }

    const data = await this.userService.createUser(user);
    delete data["password"];
    return response.send({
      Status: {
        Code: "OK",
        Message: "Successfully sign up new account, activation email has been send.",
      },
      Response: null,
    });
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async update_user(@Body() user: UserModel, @Request() request: any, @Res() response: any) {
    if (user.group_id != null) {
      if (
        user.group_id !== "" &&
        (await this.prisma.user_groups.findUnique({
          where: { id: user.group_id },
        })) == null
      ) {
        return response.status(400).send({
          Status: {
            Code: "DATA_ERROR",
            CodeDetail: "USER_GROUP_NOT_FOUND",
            Message: "Unable found user group with Group ID: " + user.group_id,
          },
          Response: null,
        });
      }
    }

    const data = await this.prisma.users.update({
      where: { id: request.user.id },
      data: user,
    });
    delete data["password"];
    return response.send({
      Status: {
        Code: "OK",
        Message: "Successfully updated.",
      },
      Response: data,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("user delete")
  async delete_user(id: string) {
    await this.prisma.users.delete({ where: { id: id } });
    return {
      Status: {
        Code: "OK",
        Message: "Successfully deleted.",
      },
      Response: null,
    };
  }
}
