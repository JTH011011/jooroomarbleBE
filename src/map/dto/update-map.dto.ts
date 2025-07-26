// src/map/dto/update-map.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMapDto } from './create-map.dto';

export class UpdateMapDto extends OmitType(
  PartialType(CreateMapDto),
  ['is_builtin'] as const, // 내장 맵 여부는 수정 금지
) {}
