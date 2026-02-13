import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (!process.env.INTERNAL_API_KEY) {
        throw new Error('INTERNAL_API_KEY must be defined in environment');
    }

    app.useGlobalFilters(new DomainExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('Cinema Service API')
        .setDescription('Cinema management microservice')
        .setVersion('1.0')
        .addTag('cinemas')
        .addTag('sessions')
        .addTag('admin')
        .addSecurity('x-api-key', {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
        })
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    const port = process.env.PORT || 3003;
    await app.listen(port);

    console.log(`API Gateway running on http://localhost:${port}`);
    console.log(
        `Swagger documentation available at http://localhost:${port}/api/docs`,
    );
}
bootstrap();
