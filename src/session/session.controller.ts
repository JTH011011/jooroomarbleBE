// src/session/session.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RequestWithUser } from '../types/request-with-user';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { ApiOperation } from '@nestjs/swagger';
import { RollDiceRequestDto } from './dto/roll-dice-request.dto';
import { RollDiceResponseDto } from './dto/roll-dice-response.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '새로운 세션을 생성합니다.' })
  createSession(@Req() req: RequestWithUser, @Body() dto: CreateSessionDto) {
    return this.service.createSession(req.user.id, dto);
  }

  @Post(':code/join')
  @ApiOperation({ summary: '세션에 참여합니다.' })
  joinSession(@Param('code') code: string, @Body() dto: JoinSessionDto) {
    return this.service.joinSession(code, dto.nickname);
  }

  @Get(':code')
  @ApiOperation({ summary: '세션 상태를 조회합니다.' })
  getSession(@Param('code') code: string) {
    return this.service.getSessionStatus(code);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':code/start')
  @ApiOperation({ summary: '세션을 시작합니다.' })
  startSession(@Param('code') code: string, @Req() req: RequestWithUser) {
    return this.service.startSession(code, req.user.id);
  }

  @Post(':code/turn') // ⬅️ Guard 제거
  @ApiOperation({ summary: '주사위를 굴립니다.' })
  rollDice(
    @Param('code') code: string,
    @Body() body: RollDiceRequestDto,
  ): Promise<RollDiceResponseDto> {
    return this.service.rollDice(code, body.guestId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '세션을 종료합니다.' })
  @Delete(':code')
  endSession(@Param('code') code: string, @Req() req: RequestWithUser) {
    return this.service.endSession(code, req.user.id);
  }

  @Get(':code/status')
  @ApiOperation({ summary: '실시간 게임 상태 조회(frontend ui)' })
  getLiveStatus(@Param('joinCode') joinCode: string) {
    return this.service.getLiveSessionStatus(joinCode);
  }
}
