import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: true,
  namespace: 'ws/session',
})
export class SessionGateway {
  constructor() {}

  @WebSocketServer()
  server: Server;

  // 모든 클라이언트를 특정 room에서 내보내기
  // SessionGateway.ts
  async kickAllClientsFromRoom(code: string) {
    // === 기존 로직 대체 ===
    // 1) room 핸들러 참조
    const room = this.server.in(code); // 수정

    // 2) 현재 room 에 실제로 연결-된 소켓 목록을 가져옴
    const sockets = await room.fetchSockets(); // 수정
    if (sockets.length === 0) {
      // 수정
      Logger.log(`Session ${code} is empty or does not exist.`); // 수정
      return;
    }

    // 3) Socket.IO v4 built-in 메서드로 한 방에 퇴장 처리
    room.socketsLeave(code); // 수정
    // └ 필요하다면 연결 자체를 끊으려면 room.disconnectSockets();
    // 4) 로그 출력
    Logger.log(`All clients have been kicked from room ${code}`); // 수정
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() payload: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.info(`Client ${client.id} joining session: ${payload.code}`);
    await client.join(payload.code);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() payload: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.info(`Client ${client.id} leaving room: ${payload.code}`);
    await client.leave(payload.code);
  }
}
