import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthorizationService } from '../authorization.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AuthorizationService.secret,
    });
  }

  async validate(payload: any) {
    if (payload.type === 'oauth') {
      const user = await this.usersService.getUserById(payload.user.uid);
      const client = await this.prisma.authorization_clients.findUnique({
        where: { client_id: payload.client.id },
      });
      delete client['client_secret'];
      return Object.assign(user, { client: client });
    } else {
      return await this.usersService.getUserById(payload.user.uid);
    }
  }
}
