import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto) {
    return this.authService.register(credentials);
  }

  @Post('login')
  login(@Body() credentials: CredentialsDto) {
    return this.authService.login(credentials);
  }
}
