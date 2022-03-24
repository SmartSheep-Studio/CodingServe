import { Body, Controller, Get, Post, Query, Render, Res } from '@nestjs/common';
import { DeveloperService } from './developer.service';

@Controller('/management/developer')
export class DeveloperController {
  constructor(private developerService: DeveloperService) {
  }

  @Get('signup')
  @Render('developer/signup')
  async signup_developer(@Query() data: object) {
    return {error: data['error'], success: data['success']}
  }

  @Post('signup')
  async confirm_signup_developer(@Body() data: object, @Res() response) {
    try {
      await this.developerService.signup_developer(data['username'], data['password']);
    } catch (e) {
      return response.redirect('/management/developer/signup?error=' + encodeURIComponent(e.message))
    }
    return response.redirect('/management/developer/signup?success=' + encodeURIComponent("Signup as developer successful!"))
  }
}
