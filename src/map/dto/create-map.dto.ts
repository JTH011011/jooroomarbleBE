// src/map/dto/create-map.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';

export class CreateMapDto {
  @ApiProperty({ description: '맵 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '맵 타일 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  tiles: any[]; // 추후 MapTile 생성 DTO로 교체

  @IsOptional()
  is_builtin?: boolean; // 수정 불가 필드, 기본 false
}
