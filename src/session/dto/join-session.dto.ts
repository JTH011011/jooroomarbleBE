// src/session/dto/join-session.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinSessionDto {
  @ApiProperty({ description: '게스트 닉네임' })
  @IsString()
  nickname: string;
}
