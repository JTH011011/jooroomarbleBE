// src/session/session.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameSession, Participant, Guest } from '@prisma/client';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMapById(mapId: number) {
    return this.prisma.map.findUnique({ where: { id: mapId } });
  }

  createGameSession(
    mapId: number,
    kingId: number,
    joinCode: string,
    maxPlayers: number,
  ) {
    return this.prisma.gameSession.create({
      data: {
        map_id: mapId,
        king_id: kingId,
        join_code: joinCode,
        max_players: maxPlayers,
      },
    });
  }

  findSessionByCode(
    joinCode: string,
  ): Promise<
    (GameSession & { participants: (Participant & { guest: Guest })[] }) | null
  > {
    return this.prisma.gameSession.findUnique({
      where: { join_code: joinCode },
      include: {
        participants: {
          include: {
            guest: true, // 참가자와 연결된 게스트 정보도 포함
          },
        },
      },
    });
  }

  createGuest(nickname: string) {
    return this.prisma.guest.create({
      data: { nickname },
    });
  }

  createParticipant(sessionId: number, guestId: string, joinOrder: number) {
    return this.prisma.participant.create({
      data: {
        session_id: sessionId,
        guest_id: guestId,
        join_order: joinOrder,
        current_pos: 0,
      },
    });
  }
  // 참가자 전체 불러오기
  findParticipantsBySession(sessionId: number) {
    return this.prisma.participant.findMany({
      where: { session_id: sessionId },
    });
  }

  // 참가자 순서 업데이트
  updateJoinOrder(participantId: number, newOrder: number) {
    return this.prisma.participant.update({
      where: { id: participantId },
      data: { join_order: newOrder },
    });
  }

  // 세션 상태 변경
  startSession(sessionId: number) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'RUN' },
    });
  }
}
