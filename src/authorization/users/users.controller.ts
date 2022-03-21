import {users as UserModel} from '@prisma/client';
import {Body, Controller, HttpCode, Put, Res, UseGuards} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {UsersService} from "./users.service";
import {JwtAuthGuard} from "../guards/jwt.guard";
import {PermissionsGuard} from "../guards/permissions.guard";
import {Permissions} from "../guards/permissions.decorator";

@Controller('management/users')
export class UsersController {
    constructor(private prisma: PrismaService, private userService: UsersService) {
    }

    @Put('create')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('user create')
    async createUser(@Body() user: UserModel, @Res() response) {
        if (await this.userService.getUserByUsername(user.username) != null) {
            return response.status(400).send({
                statusCode: 400,
                message: 'Username is duplicated.',
                error: 'DataError'
            })
        }
        if (typeof user.group_id !== "number") {
            user.group_id = 0
        }
        if (user.group_id !== 0 && await this.prisma.groups.findUnique({where: {id: user.group_id}}) == null) {
            return response.status(400).send({
                statusCode: 400,
                message: 'Provided group_id is invalid.',
                error: 'DataError'
            })
        }

        const data = await this.userService.createUser(user)
        delete data['password']
        return response.send({
            statusCode: 201,
            message: 'Successful created',
            data: data
        })
    }


}
