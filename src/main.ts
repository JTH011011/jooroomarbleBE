// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // prisma 종료 hooks 설정
  app.enableShutdownHooks();

  // 전역 ValidationPipe 적용 (DTO 데코레이터 자동 검증)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('주루마블 API')
    .setDescription('게임 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 인증을 위한 Bearer 토큰',
      },
      'JWT-auth',
    )
    .build();

  // Swagger 문서 생성
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI를 /api 경로에 연결
  SwaggerModule.setup('api', app, document);

  const PORT = 80;

  await app.listen(PORT);
  console.log(`🚀 Application running on: http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at: http://localhost:${PORT}/api`);
}

bootstrap();
