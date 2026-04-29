import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS for local dev (frontend on port 5173)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:80'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Notes App API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
