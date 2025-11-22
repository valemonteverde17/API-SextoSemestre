import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Esto habilita CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', // permite peticiones desde tu frontend de Vite
    credentials: true,               // opcional, si luego manejas cookies/tokens
  });

  const config = new DocumentBuilder()
    .setTitle('CiberEduca API')
    .setDescription('The CiberEduca API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
