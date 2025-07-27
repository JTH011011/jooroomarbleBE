// src/session/dto/create-session.dto.ts
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: '참가 guest 수' })
  @IsInt()
  @Min(2)
  maxPlayers: number;

  @ApiProperty({ description: '맵 ID' })
  @IsInt()
  mapId: number;
}
