import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ParseIntPipe, BadRequestException,} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JWTAurhGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { id?: number };
}

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  // GET /positions
  @UseGuards(JWTAurhGuard)
  @Get()
  async findAll() {
    return this.positionsService.getAllPositions();
  }

  // GET /positions/:id
  @UseGuards(JWTAurhGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.getPositionById(id);
  }

  // POST /positions
  // Creates a new position linked to the authenticated user
  @UseGuards(JWTAurhGuard)
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() body: { position_code: string; position_name: string },
  ) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID not found in request.');
    }

    // createPosition now returns the created row
    const created = await this.positionsService.createPosition({
      position_code: body.position_code,
      position_name: body.position_name,
      user_id: userId,
    });

    // return the created object (Nest will send 201 Created)
    return created;
  }

  // PUT /positions/:id
  @UseGuards(JWTAurhGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { position_code?: string; position_name?: string },
  ) {
    return this.positionsService.updatePosition(id, body);
  }

  // DELETE /positions/:id
  @UseGuards(JWTAurhGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.deletePosition(id);
  }
}