import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Movie Service')
    .setDescription('API for searching movies from OMDB')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`Movie service running on http://localhost:${port}`);
  console.log(
    `Swagger documentation available at http://localhost:${port}/docs`,
  );
}
bootstrap();
