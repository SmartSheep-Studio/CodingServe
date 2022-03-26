import {v4 as uuidv4} from 'uuid';
import {Injectable} from '@nestjs/common';
import {users as UserModel} from '@prisma/client';
import {PrismaService} from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

    async getUserByUsername(username: string): Promise<any> {
        return await this.prisma.users.findUnique({where: {username: username}});
    }
    async getUserById(uid: string): Promise<any> {
        return await this.prisma.users.findUnique({where: {id: uid}});
    }

    async createUser(user: UserModel) {
        user.id = uuidv4()
        user.password = await bcrypt.hash(user.password, await bcrypt.genSalt())
        await this.prisma.users.create({data: user})
        return user
    }
}
