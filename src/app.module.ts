// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MapModule } from './map/map.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [PrismaModule, AuthModule, MapModule, SessionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
