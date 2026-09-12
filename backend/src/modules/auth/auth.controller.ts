import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('signup') @ApiOperation({ summary: 'Create an account and session' }) @ApiResponse({ status: 201, description: 'Account created' })
  async signup(@Body() dto: SignUpDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.signup(dto); this.setCookie(response, result.token); return result.user; }
  @Post('login') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Sign in securely' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.login(dto); this.setCookie(response, result.token); return result.user; }
  @Post('logout') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Clear the current session' })
  logout(@Res({ passthrough: true }) response: Response) { response.clearCookie('tempo_session', { path: '/' }); return { message: 'Signed out' }; }
  @Get('me') @UseGuards(JwtAuthGuard) @ApiCookieAuth('session-cookie') @ApiOperation({ summary: 'Get the authenticated user' })
  me(@CurrentUser() user: AuthUser) { return this.auth.profile(user.id); }
  private setCookie(response: Response, token: string) { response.cookie('tempo_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 }); }
}
