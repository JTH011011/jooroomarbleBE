// src/session/dto/session-play-status.dto.ts
export class SessionPlayStatusDto {
  turnNo: number;
  currentGuest: {
    participantId: number;
    guestId: string;
    nickname: string;
    joinOrder: number;
  };
  currentPos: number;
  currentTile: {
    idx: number;
    description: string;
    defaultAction: any;
  };
  participants: {
    participantId: number;
    guestId: string;
    nickname: string;
    joinOrder: number;
  }[];
}
