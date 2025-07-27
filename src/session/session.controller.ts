// src/session/session.controller.ts
import { Body, Controller, Post, Req, UseGuards, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../types/request-with-user';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createSession(@Req() req: RequestWithUser, @Body() dto: CreateSessionDto) {
    return this.service.createSession(req.user.id, dto);
  }

  @Post(':code/join')
  joinSession(@Param('code') code: string, @Body() dto: JoinSessionDto) {
    return this.service.joinSession(code, dto.nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':code/start')
  startSession(@Param('code') code: string, @Req() req: RequestWithUser) {
    return this.service.startSession(code, req.user.id);
  }
}
