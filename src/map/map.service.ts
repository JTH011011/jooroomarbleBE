// src/map/map.service.ts
import { Injectable } from '@nestjs/common';
import { MapRepository } from './map.repository';

@Injectable()
export class MapService {
  constructor(private readonly mapRepo: MapRepository) {}

  getMyMaps(userId: number) {
    return this.mapRepo.findAccessibleMaps(userId);
  }
}
