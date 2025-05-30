// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile app
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:19006'], // Add your mobile app URLs
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Koshoro Events API')
    .setDescription('API for aggregating and serving events across Nigeria')
    .setVersion('1.0')
    .addTag('events', 'Events management endpoints')
    .addTag('scrapers', 'Web scraping endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(
    `🚀 Koshoro API is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

bootstrap();
