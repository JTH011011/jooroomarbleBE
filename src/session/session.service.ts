// src/session/session.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { customAlphabet } from 'nanoid';
import { Participant, Guest } from '@prisma/client';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6);

@Injectable()
export class SessionService {
  constructor(private readonly repo: SessionRepository) {}

  async createSession(userId: number, dto: CreateSessionDto) {
    const map = await this.repo.findMapById(dto.mapId);
    if (!map) throw new NotFoundException('맵을 찾을 수 없습니다.');

    // 내장 맵이거나 내가 만든 맵인지 확인
    if (!map.is_builtin && map.king_id !== userId) {
      throw new ForbiddenException('맵 소유자가 아닙니다.');
    }

    const joinCode = nanoid();
    const session = await this.repo.createGameSession(
      dto.mapId,
      userId,
      joinCode,
      dto.maxPlayers,
    );
    return {
      sessionId: session.id,
      joinCode: session.join_code,
    };
  }

  async joinSession(joinCode: string, nickname: string) {
    const session = await this.repo.findSessionByCode(joinCode);
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

    if (session.participants.length >= session.max_players) {
      throw new ForbiddenException('세션이 가득 찼습니다.');
    }

    const guest = await this.repo.createGuest(nickname);

    const joinOrder = session.participants.length;
    const participant = await this.repo.createParticipant(
      session.id,
      guest.id,
      joinOrder,
    );

    return {
      sessionId: session.id,
      guestId: guest.id,
      participantId: participant.id,
    };
  }

  async startSession(joinCode: string, userId: number) {
    const session = await this.repo.findSessionByCode(joinCode);
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

    if (session.king_id !== userId) {
      throw new ForbiddenException('방장만 시작할 수 있습니다.');
    }

    if (session.status !== 'WAIT') {
      throw new ForbiddenException('이미 시작된 세션입니다.');
    }

    if (session.participants.length !== session.max_players) {
      throw new ForbiddenException('아직 참가자가 부족합니다.');
    }

    // 랜덤하게 섞은 participant 리스트
    const shuffled: (Participant & { guest: Guest })[] = [
      ...session.participants,
    ].sort(() => Math.random() - 0.5);

    // join_order 재배정
    for (let i = 0; i < shuffled.length; i++) {
      await this.repo.updateJoinOrder(shuffled[i].id, i);
    }

    // 세션 상태 RUN으로 변경
    await this.repo.startSession(session.id);

    // 최신 join_order 순으로 정렬된 결과 반환
    const sorted = shuffled.map((p, i) => ({
      participantId: p.id,
      nickname: p.guest.nickname,
      joinOrder: i,
    }));

    return {
      sessionId: session.id,
      status: 'RUN',
      orderedParticipants: sorted,
    };
  }
}
