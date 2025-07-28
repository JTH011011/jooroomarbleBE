// src/prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// ───────── 타일 정의 (29칸) ─────────
const tiles: Prisma.MapTileCreateWithoutMapInput[] = [
  /* 0. 시작(적립) ──────────────────────────────────────────── */
  {
    idx: 0,
    tile_type: 'START',
    description: '폭탄 칸에서 적립된 술을 마십니다!',
    default_action: { type: 'drink_pot' } as Prisma.InputJsonValue,
  },

  /* 1 ~ 23 (CUSTOM = 게임/액션 칸) ─────────────────────────── */
  {
    idx: 1,
    tile_type: 'CUSTOM', // 손병호 게임
    description: '손병호 게임',
  },
  {
    idx: 2,
    tile_type: 'DRINK',
    description: '카이스트 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  {
    idx: 3,
    tile_type: 'DRINK',
    description: '좌3우3 마시기',
    default_action: {
      type: 'popup',
      message: '본인과 왼쪽 3명, 오른쪽 3명이 함께 술을 마십니다',
    } as Prisma.InputJsonValue,
  },
  {
    idx: 4,
    tile_type: 'CUSTOM',
    description: '랜덤게임',
    default_action: {
      type: 'popup',
      message: '랜덤 게임을 직접 제안해서 시작하세요!',
    } as Prisma.InputJsonValue,
  },
  {
    idx: 5,
    tile_type: 'DRINK',
    description: '나빼고 다 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  {
    idx: 6,
    tile_type: 'DRINK',
    description: '걸린사람 팀메이트 마셔',
    default_action: {
      type: 'popup',
      message: '던진 사람과 팀메이트가 사이 좋게 한 잔 마십니다!',
    } as Prisma.InputJsonValue,
  },
  { idx: 7, tile_type: 'DRINK', description: '타대생 마셔' },
  { idx: 8, tile_type: 'CUSTOM', description: '이미지 게임' },
  { idx: 9, tile_type: 'DRINK', description: '엠준위 빼고 마셔' },
  {
    idx: 10,
    tile_type: 'DRINK',
    description: '다같이 짠!!',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  { idx: 11, tile_type: 'CUSTOM', description: '눈치게임' },
  {
    idx: 12,
    tile_type: 'DRINK',
    description: '훈민정음 (1바퀴동안)',
    default_action: {
      type: 'popup',
      message: '지금부터 한 바퀴동안 영어 쓰면 마십니다!',
    } as Prisma.InputJsonValue,
  },
  {
    idx: 13,
    tile_type: 'DRINK',
    description: '스크럼 지각한 사람 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  {
    idx: 14,
    tile_type: 'DRINK',
    description: '4분반 외모 순위 1~5위 마셔',
    default_action: {
      type: 'popup',
      message: '지목으로 투표',
    } as Prisma.InputJsonValue,
  },

  /* 15. 사다리 진입 ───────────────────────────────────────── */
  {
    idx: 15,
    tile_type: 'CUSTOM',
    description: '물/술 시작!!',
    default_action: { type: 'ladder_start' } as Prisma.InputJsonValue,
  },

  /* 16 ~ 23 ──────────────────────────────────────────────── */
  {
    idx: 16,
    tile_type: 'DRINK',
    description: '02년생 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  { idx: 17, tile_type: 'DRINK', description: 'mac 안쓰는 사람 마셔' },
  {
    idx: 18,
    tile_type: 'CUSTOM',
    description: '랜덤게임',
    default_action: {
      type: 'popup',
      message: '랜덤 게임을 직접 제안해서 시작하세요!',
    } as Prisma.InputJsonValue,
  },
  {
    idx: 19,
    tile_type: 'DRINK',
    description: '금픽 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  { idx: 20, tile_type: 'DRINK', description: '공산당' },
  {
    idx: 21,
    tile_type: 'DRINK',
    description: 'mbti I 마셔',
    default_action: { type: 'bomb' } as Prisma.InputJsonValue,
  },
  {
    idx: 22,
    tile_type: 'DRINK',
    description: "학과 이름에 '컴퓨터' 있는 사람 마셔",
  },
  {
    idx: 23,
    tile_type: 'DRINK',
    description: '너 마셔',
    default_action: {
      type: 'popup',
      message: '지목한 사람이 마십니다',
    } as Prisma.InputJsonValue,
  },

  /* 사다리 구간 24~28 ────────────────────────────────────── */
  { idx: 24, tile_type: 'DRINK', description: '술' },
  { idx: 25, tile_type: 'DRINK', description: '물' },
  { idx: 26, tile_type: 'DRINK', description: '술' },
  { idx: 27, tile_type: 'DRINK', description: '물' },
  { idx: 28, tile_type: 'DRINK', description: '술 (복귀)' },
];

async function main() {
  const exists = await prisma.map.findFirst({
    where: { title: '몰캠 주루마블' },
  });
  if (exists) {
    console.log('ℹ️ 이미 맵 존재 – seed 스킵');
    return;
  }

  await prisma.map.create({
    data: {
      title: '몰캠 주루마블',
      is_builtin: true,
      tiles: { create: tiles },
    },
  });

  console.log('✅ 몰캠 주루마블 맵이 생성되었습니다!');
}

/* --- 실행 및 종료 핸들링 --- */
main()
  .catch((e) => {
    console.error('시드 실패:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
