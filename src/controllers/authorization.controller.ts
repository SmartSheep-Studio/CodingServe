import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.guard';
import { AuthorizationService } from '../services/authorization.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('authenticate')
@ApiTags('授权')
export class AuthorizationController {
  constructor(private authorizationService: AuthorizationService) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  async getAccessToken(@Request() request) {
    return this.authorizationService.signJWT(request.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() request) {
    delete request.user['password'];
    return request.user;
  }
}
