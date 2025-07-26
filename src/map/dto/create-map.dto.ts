import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';

export class CreateMapDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  tiles: any[]; // 추후 MapTile 생성 DTO로 교체

  @IsOptional()
  is_builtin?: boolean; // 수정 불가 필드, 기본 false
}
