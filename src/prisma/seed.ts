// src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 이미 있다면 생성하지 않음 (중복 방지)
  const existing = await prisma.map.findFirst({
    where: { title: '몰캠 주루마블' },
  });

  if (!existing) {
    await prisma.map.create({
      data: {
        title: '몰캠 주루마블',
        is_builtin: true,
        // king_id: null 생략 가능
        tiles: {
          create: [
            {
              idx: 0,
              tile_type: 'DRINK',
              description: '첫 번째 칸, 원샷!',
            },
            {
              idx: 1,
              tile_type: 'MOVE',
              description: '뒤로 2칸 이동!',
              default_action: {
                type: 'move',
                value: -2,
              },
            },
            // ...더 추가 가능
          ],
        },
      },
    });

    console.log('✅ 몰캠 주루마블 맵이 생성되었습니다!');
  } else {
    console.log('ℹ️ 이미 맵이 존재합니다. 시드 스킵.');
  }
}

main()
  .catch((e) => {
    console.error('시드 실패:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
