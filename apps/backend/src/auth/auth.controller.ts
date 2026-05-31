import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() input: SignInDto) {
    return this.authService.signIn(input);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() input: SignUpDto) {
    return this.authService.signUp(input);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() input: RefreshTokenDto) {
    return this.authService.refreshToken(input.refreshToken);
  }
}
