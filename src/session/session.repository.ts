// src/session/session.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameSession, Participant, Guest, Prisma } from '@prisma/client';

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
    current_pos: number = 0, // 초기 위치는 0
  ) {
    return this.prisma.gameSession.create({
      data: {
        map_id: mapId,
        king_id: kingId,
        join_code: joinCode,
        max_players: maxPlayers,
        current_pos,
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

  // 세션 코드로 전체 정보 조회 (게임 진행용)
  async findSessionWithMapAndParticipants(joinCode: string) {
    return this.prisma.gameSession.findUnique({
      where: { join_code: joinCode },
      include: {
        participants: {
          include: { guest: true },
          orderBy: { join_order: 'asc' },
        },
        turns: {
          orderBy: { turn_no: 'desc' },
        },
        map: {
          include: { tiles: true },
        },
      },
    });
  }

  findSessionForTurn(joinCode: string) {
    return this.prisma.gameSession.findUnique({
      where: { join_code: joinCode },
      include: {
        participants: { orderBy: { join_order: 'asc' } },
        turns: { orderBy: { turn_no: 'desc' }, take: 1 },
        map: { include: { tiles: true } },
      },
    });
  }

  /** 트랜잭션용 헬퍼 */
  updateAfterRoll(data: {
    sessionId: number;
    newPos: number;
    newTurnNo: number;
    participantId: number;
    dice: number;
    from: number;
    to: number;
    tileId: number;
    action: Prisma.InputJsonValue;
  }) {
    return this.prisma.$transaction([
      this.prisma.gameSession.update({
        where: { id: data.sessionId },
        data: { current_pos: data.newPos },
      }),
      this.prisma.turn.create({
        data: {
          session_id: data.sessionId,
          participant_id: data.participantId,
          turn_no: data.newTurnNo,
          dice: data.dice,
          from_pos: data.from,
          to_pos: data.to,
          tile_events: {
            create: {
              tile_id: data.tileId,
              action_result: data.action,
            },
          },
        },
      }),
    ]);
  }

  getSessionStatusInGame(joinCode: string) {
    return this.prisma.gameSession.findUnique({
      where: { join_code: joinCode },
      include: {
        participants: {
          include: { guest: true },
          orderBy: { join_order: 'asc' },
        },
        turns: {
          orderBy: { turn_no: 'desc' },
          take: 1,
        },
        map: {
          include: { tiles: true },
        },
      },
    });
  }

  setLadderRemaining(sessionId: number, remain: number) {
    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { ladder_remaining: remain },
    });
  }

  findSessionWithGuests(joinCode: string) {
    return this.prisma.gameSession.findUnique({
      where: { join_code: joinCode },
      include: {
        participants: {
          select: {
            guest_id: true,
          },
        },
      },
    });
  }

  async endAndDeleteSession(sessionId: number, guestIds: string[]) {
    await this.prisma.$transaction([
      this.prisma.gameSession.delete({ where: { id: sessionId } }), // cascade
      this.prisma.guest.deleteMany({ where: { id: { in: guestIds } } }), // manual
    ]);
  }
}
