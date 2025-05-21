import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthServicePort } from '@/application/ports/in/services/auth.service.port';
import { RegisterUserDto, LoginDto } from '@/application/dtos/auth/auth.dto';
import { AuthResponseDto } from '@/application/dtos/auth/auth-response.dto';
import { UserResponseDto } from '@/application/dtos/user/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthServicePort) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    const user = await this.authService.register(registerDto);
    return new UserResponseDto(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.authService.login(loginDto);
    return new AuthResponseDto(token, user);
  }
}
