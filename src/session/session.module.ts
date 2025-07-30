// src/session/session.module.ts
import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionGateway } from './session.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, SessionGateway],
})
export class SessionModule {}
