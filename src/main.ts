import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Esto habilita CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', // permite peticiones desde tu frontend de Vite
    credentials: true,               // opcional, si luego manejas cookies/tokens
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
