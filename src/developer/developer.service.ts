import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from '../authorization/authorization.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  authorization_clients as ClientModel,
  users as UserModel,
} from '@prisma/client';

@Injectable()
export class DeveloperService {
  constructor(
    private prisma: PrismaService,
    private authorizationService: AuthorizationService,
  ) {}

  async signup_developer(username: string, password: string) {
    const user = await this.authorizationService.validateUser(
      username,
      password,
    );
    if (!user) {
      throw new Error('Failed to sign up, user is not found (AU#CR04)');
    }
    if (user.group_id !== 0) {
      throw new Error('User alrealy in a user group (GU#AL05)');
    }
    let developer_group = await this.prisma.groups.findUnique({
      where: { name: 'Developer' },
    });
    if (!developer_group) {
      console.warn("Didn't found developer group, created.");
      developer_group = await this.prisma.groups.create({
        data: {
          name: 'Developer',
          permissions: ['oauth-client management'],
        },
      });
    }
    await this.prisma.users.update({
      where: { id: user.id },
      data: { group_id: developer_group.id },
    });
  }

  async register_client(developer: UserModel, client: ClientModel) {
    client.id = uuidv4();
    const origin_secret = uuidv4().replaceAll('-', '').toUpperCase();
    client.client_secret = await bcrypt.hash(
      origin_secret,
      await bcrypt.genSalt(),
    );
    client.client_id = uuidv4().replaceAll('-', '').toUpperCase();
    client.developer_id = developer.id;
    const data = await this.prisma.authorization_clients.create({
      data: client,
    });
    data.client_secret = origin_secret;
    return data;
  }
}
