import { Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenType } from './type/token.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(
      token,
      TokenType.REFRESH,
    );
    return {
      accessToken: await this.authService.issueToken(payload, TokenType.ACCESS),
    };
  }
}
