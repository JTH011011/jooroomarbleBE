// src/map/map.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MapService } from './map.service';
import { RequestWithUser } from '../types/request-with-user';

@ApiTags('maps')
@Controller('maps')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '내가 접근 가능한 맵 리스트' })
  @Get()
  getMyMaps(@Req() req: RequestWithUser) {
    return this.mapService.getMyMaps(req.user.id);
  }
}
