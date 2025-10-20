import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JWTAurhGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: number; role: string; [key: string]: any };
}

@Controller('users')
@UseGuards(JWTAurhGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAll(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.usersService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
  if (req.user.role != 'admin' && req.user.userId != +id)
    throw new ForbiddenException('You can only access your own data');

  return this.usersService.findById(+id);
  }

  @Post()
  async create(@Body() body: { username: string; password: string; role?: string }, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.usersService.createUser(body.username, body.password, body.role || 'user');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin' && req.user.userId !== +id) {
      throw new ForbiddenException('You can only update your own data');
    }
    return this.usersService.updateUser(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.usersService.deleteUser(+id);
  }
}