// i add the `Req` (to get request object) and `UnauthorizedException` (to throw errors on failed auth)
// and also i Added this import request so i can type requests (used in logout for JWT guard)
// and new import: JWT Guard for protecting certain routes (like logout)
import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JWTAurhGuard } from './jwt-auth.guard';

// i add this new interface for typed requests that include user info (set by JWT strategy)
interface AuthenticatedRequest extends Request {
  user?: { userId: number; [key: string]: any };
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    // now `await` the user creation, ensuring DB insertion completes before responding
    const user = await this.usersService.createUser(body.username, body.password);
    // Improved response: returns success message + created user
    return { message: 'User registered successfully', user };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    // i hanged the error handling: instead of `{ error: 'Invalid credentials' }`
    // now throwing a proper `UnauthorizedException` (NestJS standard practice)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JWTAurhGuard)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    // i changed the parameter: before it expected `userId` from request body
    // now it gets `userId` from JWT payload attached to `req.user`
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('User not authenticated');
      // Added explicit error handling if no valid user found
    }
    await this.authService.logout(req.user.userId);

    // Improved response: returns success message instead of raw service result
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }
}
