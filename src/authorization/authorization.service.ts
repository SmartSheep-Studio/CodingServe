import * as bcrypt from 'bcrypt';
import {Injectable} from '@nestjs/common';
import {UsersService} from "./users/users.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthorizationService {
    public static secret = 'FUMBNyKCKoWP2aKFZy6rPRRDuWt20Y70';

    constructor(private usersService: UsersService, private jwtService: JwtService) {
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async signJWT(user: any) {
        const payload = {username: user.username, uid: user.id}
        return {
            token: this.jwtService.sign(payload)
        }
    }
}
