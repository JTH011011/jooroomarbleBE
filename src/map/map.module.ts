// src/map/map.module.ts
import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { MapRepository } from './map.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MapController],
  providers: [MapService, MapRepository],
  exports: [MapService],
})
export class MapModule {}
