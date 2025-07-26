// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입 (Sign up)' })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    schema: { example: { message: '회원가입 성공', userId: 1 } },
  })
  @ApiConflictResponse({ description: '이미 존재하는 이메일' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인 (Sign in)' })
  @ApiOkResponse({
    description: '로그인 성공, JWT 토큰 반환',
    schema: { example: { accessToken: 'eyJ...' } },
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 오류' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
