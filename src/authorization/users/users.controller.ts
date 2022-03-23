import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Body, Controller, Get, Post, Query, Render, Res } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('management/users')
export class UsersController {
  constructor(private prisma: PrismaService) {
  }

  @Get('signup')
  @Render('oauth/signup')
  async signup_user(@Query() query: object) {
    return { error: query['error'], success: query['success'] };
  }

  @Post('signup')
  async confirm_signup_user(@Body() data: object, @Res() response) {
    if (data['password'] !== data['confirm_password']) {
      return response.redirect('/management/users/signup?error=' + encodeURIComponent('Passwords do not match (SU#PS04)'));
    }
    if (await this.prisma.users.findUnique({ where: { username: data['username'] } }) != null) {
      return response.redirect('/management/users/signup?error=' + encodeURIComponent('Username is duplicated (SU#UN04)'));
    }
    await this.prisma.users.create({
      data: {
        username: data['username'],
        password: await bcrypt.hash(data['password'], await bcrypt.genSalt()),
        id: uuidv4(),
        group_id: 0,
      },
    });
    return response.redirect('/management/users/signup?success=' + encodeURIComponent('Sign up successfully'));
  }
}
