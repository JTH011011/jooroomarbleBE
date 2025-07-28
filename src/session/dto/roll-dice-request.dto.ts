// src/session/dto/roll-dice-request.dto.ts
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RollDiceRequestDto {
  @ApiProperty({ description: '게스트 UUID' })
  @IsString()
  @IsUUID()
  guestId: string;
}
