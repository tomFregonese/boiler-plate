import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const config = new DocumentBuilder()
    .setTitle('Booking Service')
    .setDescription(
      'Booking microservice: creation, confirmation, cancellation, optional payment. IDs exchanged between services as String (UUID/CUID).',
    )
    .setVersion('1.0.0')
    .addTag('Bookings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3004;
  await app.listen(port);
  console.log(`Booking service is running on: http://localhost:${port}`);
  console.log(`Swagger API docs available at: http://localhost:${port}/docs`);
}
bootstrap();
