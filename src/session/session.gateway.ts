import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: true,
  namespace: 'ws/session',
})
export class SessionGateway {
  constructor() {}

  @WebSocketServer()
  server: Server;

  // 모든 클라이언트를 특정 room에서 내보내기
  async kickAllClientsFromRoom(code: string) {
    const adapter = this.server.sockets.adapter;
    const socketsInRoom = adapter.rooms.get(code);

    if (!socketsInRoom) {
      console.log(`Session ${code} is empty or does not exist.`);
      return;
    }

    for (const socketId of socketsInRoom) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        await socket.leave(code); // 룸에서 나가게
      }
    }

    console.log(`All clients have been kicked from room ${code}`);
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
