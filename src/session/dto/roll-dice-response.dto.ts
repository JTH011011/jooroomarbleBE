// src/session/dto/roll-dice-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class RollDiceResponseDto {
  @ApiProperty({ description: '현재 턴 번호' })
  turnNo: number;

  @ApiProperty({ description: '주사위 값 (1~6)' })
  @IsInt()
  @Min(1)
  @Max(6)
  dice: number;

  @ApiProperty({ description: '이동 전 위치' })
  fromPos: number;

  @ApiProperty({ description: '이동 후 위치' })
  toPos: number;

  @ApiProperty({
    description: '도착한 타일 정보',
    type: () => TileDto, // 아래 TileDto로 따로 분리하면 Swagger UI에서도 예쁘게 나옴
  })
  tile: TileDto;
}

export class TileDto {
  @ApiProperty({ description: '타일 번호 (idx)' })
  idx: number;

  @ApiProperty({ description: '타일 설명' })
  description: string;

  @ApiProperty({ description: '기본 액션', required: false })
  defaultAction?: any;
}
