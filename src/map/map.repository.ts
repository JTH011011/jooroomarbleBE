// src/map/map.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 기본 맵 + 내가 만든 맵 가져오기 */
  findAccessibleMaps(userId: number) {
    return this.prisma.map.findMany({
      where: {
        OR: [
          { king_id: userId }, // 내가 king 인 맵
          { is_builtin: true }, // 모든 유저가 볼 수 있는 내장 맵
        ],
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
