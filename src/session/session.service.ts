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
import { PrismaService } from 'src/prisma/prisma.service';
import { RollDiceResponseDto } from './dto/roll-dice-response.dto';
import { SessionPlayStatusDto } from './dto/session-play-status.dto';
import { BadRequestException } from '@nestjs/common';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6);

@Injectable()
export class SessionService {
  constructor(
    private readonly repo: SessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  /** 사다리/순환 포함 1칸 전진 */
  private nextTile(pos: number): number {
    if (pos === 28) return 5; // 28→5
    if (pos >= 24 && pos <= 27) return pos + 1; // 24→25→…→28
    if (pos === 15) return 24; // 15→24 (사다리 첫 칸)
    return (pos + 1) % 29; // 일반
  }

  /** fromPos에서 dice만큼 이동(사다리 로직 포함) */
  private simulateMove(fromPos: number, dice: number): number {
    let cur = fromPos;
    for (let i = 0; i < dice; i++) {
      cur = this.nextTile(cur);
    }
    return cur;
  }

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
      0, // 초기 위치는 0
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

  async getSessionStatus(joinCode: string) {
    const session = await this.repo.findSessionByCode(joinCode);
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

    const currentPlayers = session.participants.length;

    return {
      sessionId: session.id,
      status: session.status,
      maxPlayers: session.max_players,
      currentPlayers,
      isReadyToStart: currentPlayers === session.max_players,
      participants: session.participants.map((p) => ({
        nickname: p.guest.nickname,
        joinOrder: p.join_order,
      })),
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

    if (session.participants.length < 2) {
      throw new ForbiddenException(
        '참가자가 2명 이상이어야 시작할 수 있습니다.',
      );
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
  /** 사다리·말 하나 규칙 포함 주사위 굴리기 */
  async rollDice(
    joinCode: string,
    guestId: string, // ➟ 게스트 UUID
  ): Promise<RollDiceResponseDto> {
    /* ── 세션 & 기초 검증 ─────────────────────────────── */
    const session = await this.repo.findSessionForTurn(joinCode);
    if (!session) throw new NotFoundException('세션 없음');
    if (session.status !== 'PLAYING')
      throw new BadRequestException('게임이 시작되지 않았습니다.');

    const players = session.participants;
    if (!players.length) throw new BadRequestException('참가자 없음');

    /* ── 현재 턴 참가자 판별 ─────────────────────────── */
    const lastTurnNo = session.turns[0]?.turn_no ?? 0;
    const turnIdx = lastTurnNo % players.length;
    const currentP = players[turnIdx];

    if (currentP.guest_id !== guestId)
      throw new ForbiddenException('당신 차례가 아닙니다');

    /* ── 주사위 굴리기 ──────────────────────────────── */
    const dice = Math.floor(Math.random() * 6) + 1;
    const fromPos = session.current_pos; // 말 위치
    let toPos = fromPos;

    /* ── 사다리 규칙 적용 ───────────────────────────── */
    const remain = session.ladder_remaining; // 0 = 사다리 아님

    if (fromPos === 15) {
      /* ① 15에 정확히 멈춘 직후 턴 → 탑승 시작 */
      await this.repo.setLadderRemaining(session.id, 6);
      toPos = this.simulateMove(fromPos, dice); // 24부터 주사위 만큼 이동
    } else if (remain > 0) {
      /* ② 이미 사다리 위 */
      toPos = this.simulateMove(fromPos, dice);
      const remainAfter = remain - dice;
      await this.repo.setLadderRemaining(
        session.id,
        remainAfter <= 0 ? 0 : remainAfter,
      );
    } else {
      /* ③ 일반 이동 */
      toPos = this.simulateMove(fromPos, dice);
    }

    const tile = session.map.tiles.find((t) => t.idx === toPos)!;

    /* ── DB 트랜잭션 저장 ───────────────────────────── */
    await this.repo.updateAfterRoll({
      sessionId: session.id,
      newPos: toPos,
      newTurnNo: lastTurnNo + 1,
      participantId: currentP.id,
      dice,
      from: fromPos,
      to: toPos,
      tileId: tile.id,
      action: tile.default_action ?? {},
    });

    /* ── 응답 DTO ──────────────────────────────────── */
    return {
      turnNo: lastTurnNo + 1,
      dice,
      fromPos,
      toPos,
      tile: {
        idx: tile.idx,
        description: tile.description ?? '',
        defaultAction: tile.default_action,
      },
    };
  }
  async beginPlaySession(joinCode: string, userId: number) {
    const session = await this.repo.findSessionByCode(joinCode);
    if (!session) throw new NotFoundException('세션 없음');

    if (session.king_id !== userId) throw new ForbiddenException('방장만 가능');

    if (session.status !== 'RUN')
      throw new ForbiddenException('현재 단계가 순서 배정이 아닙니다.');

    await this.repo.playSession(session.id);
    return { sessionId: session.id, status: 'PLAYING' };
  }

  async endSession(joinCode: string, userId: number): Promise<void> {
    const session = await this.repo.findSessionWithGuests(joinCode);
    if (!session) throw new NotFoundException('세션 없음');

    if (session.king_id !== userId)
      throw new ForbiddenException('세션 종료 권한 없음');

    await this.repo.endAndDeleteSession(
      session.id,
      session.participants.map((p) => p.guest_id),
    );
  }

  async getBoardData(joinCode: string) {
    const session = await this.repo.findSessionWithMapAndParticipants(joinCode);
    if (!session) throw new NotFoundException('세션 없음');
    if (session.status === 'WAIT')
      throw new BadRequestException('게임이 아직 시작되지 않았습니다.');

    return {
      sessionId: session.id,
      status: session.status,
      map: {
        id: session.map.id,
        title: session.map.title,
        tiles: session.map.tiles.map((t) => ({
          idx: t.idx,
          tileType: t.tile_type,
          description: t.description,
          defaultAction: t.default_action,
        })),
      },
      participants: session.participants.map((p) => ({
        participantId: p.id,
        guestId: p.guest_id,
        nickname: p.guest.nickname,
        joinOrder: p.join_order,
      })),
      currentPos: session.current_pos,
    };
  }

  async getLiveSessionStatus(joinCode: string): Promise<SessionPlayStatusDto> {
    const session = await this.repo.getSessionStatusInGame(joinCode);
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

    if (session.status !== 'PLAYING') {
      throw new BadRequestException('게임이 아직 시작되지 않았습니다.');
    }

    const lastTurnNo = session.turns[0]?.turn_no ?? 0;
    const turnIdx = lastTurnNo % session.participants.length;
    const currentP = session.participants[turnIdx];

    const curTile = session.map.tiles.find(
      (t) => t.idx === session.current_pos,
    )!;

    return {
      turnNo: lastTurnNo,
      currentGuest: {
        participantId: currentP.id,
        guestId: currentP.guest_id,
        nickname: currentP.guest.nickname,
        joinOrder: currentP.join_order,
      },
      currentPos: session.current_pos,
      currentTile: {
        idx: curTile.idx,
        description: curTile.description ?? '',
        defaultAction: curTile.default_action ?? {},
      },
      participants: session.participants.map((p) => ({
        participantId: p.id,
        guestId: p.guest_id,
        nickname: p.guest.nickname,
        joinOrder: p.join_order,
      })),
    };
  }
  async leaveSession(joinCode: string, guestId: string) {
    const session = await this.repo.findSessionByCode(joinCode);
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

    const leaving = session.participants.find((p) => p.guest_id === guestId);
    if (!leaving) throw new ForbiddenException('이 세션 참가자가 아닙니다.');

    // ① 참가자+게스트 동시 삭제
    await this.repo.deleteParticipantWithGuest(leaving.id, guestId);

    // ② 참가자 전원 나가면 세션도 삭제
    const restCnt = session.participants.length - 1;
    if (restCnt === 0) {
      await this.repo.endAndDeleteSession(session.id, []); // guest 이미 제거됨
    }

    return { ok: true };
  }
}
