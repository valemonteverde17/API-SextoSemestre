import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:5173'];
    
    app.enableCors({
      origin: corsOrigin, // Ahora es un array
      credentials: true,
    });

  const config = new DocumentBuilder()
    .setTitle('CiberEduca API')
    .setDescription(
      `
API para la plataforma educativa CiberEduca.

**Autenticación:**
- La mayoría de los endpoints requieren autenticación JWT
- Obtén un token usando POST /auth/login
- Haz clic en el botón "Authorize" arriba y pega el token (sin 'Bearer')
- El token se incluirá automáticamente en todas las peticiones
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT (sin "Bearer")',
        in: 'header',
      },
      'bearer', // This name must match @ApiBearerAuth('bearer') in controllers
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
