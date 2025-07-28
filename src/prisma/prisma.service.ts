import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'warn', 'error'],
    });

    // 미들웨어로 "closed" 연결 자동 재시도 처리
    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (e: any) {
        if (e?.message?.includes('kind: Closed')) {
          this.logger.warn('DB 연결이 닫혀 재연결 시도 중...');
          try {
            await this.$connect(); // 재연결 시도
            this.logger.log('재연결 성공');
            return await next(params); // 쿼리 재시도
          } catch (reconnectErr) {
            this.logger.error('DB 재연결 실패', reconnectErr);
            throw reconnectErr;
          }
        }
        throw e;
      }
    });
  }

  /** NestJS 애플리케이션 시작 시 DB 연결 */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma DB 연결 성공');
    } catch (e) {
      this.logger.error('Prisma DB 연결 실패', e);
      throw e;
    }
  }

  /** 애플리케이션 종료 시 DB 연결 종료 */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
