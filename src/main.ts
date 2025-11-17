import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 👉 Esto habilita CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // 👉 Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('CiberEduca API')
    .setDescription(
      `
# 🎓 CiberEduca - API de Gestión Educativa

API RESTful para la gestión de contenido educativo con sistema de roles y aprobación.

## 🔐 Autenticación

Esta API utiliza **JWT (JSON Web Tokens)** para autenticación. Para acceder a los endpoints protegidos:

1. Obtén un token mediante \`POST /auth/login\` o \`POST /auth/register\`
2. Incluye el token en el header: \`Authorization: Bearer {token}\`
3. El token expira en 24 horas por defecto

## 👥 Roles del Sistema

- **admin**: Control total del sistema, aprueba usuarios y contenido
- **revisor**: Puede revisar y aprobar contenido educativo
- **docente**: Crea y gestiona contenido educativo
- **estudiante**: Consume contenido educativo

## 📋 Flujo de Aprobación

### Usuarios:
- **Estudiantes**: Activos automáticamente al registrarse
- **Docentes independientes**: Requieren aprobación de admin
- **Docentes de organización**: Activos automáticamente si son creados por admin

### Contenido (Topics):
1. **Draft**: Creación inicial, editable
2. **Pending Review**: Enviado para revisión
3. **Approved**: Aprobado y visible
4. **Rejected**: Rechazado con comentarios
5. **Archived**: Archivado pero no eliminado

## 🏢 Organizaciones

Las organizaciones permiten agrupar usuarios y contenido:
- Cada organización tiene un administrador
- Los usuarios pueden pertenecer a una organización
- El contenido puede ser público, de organización o privado

## 📊 Estados de Usuario

- **active**: Usuario activo, puede usar el sistema
- **pending**: Esperando aprobación de admin
- **suspended**: Suspendido temporalmente
- **rejected**: Rechazado permanentemente

## 🔗 Enlaces Útiles

- [Repositorio GitHub](https://github.com/valemonteverde17/API-SextoSemestre)
- [Documentación Completa](./README.md)`,
    )
    .setVersion('1.0.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu JWT token (sin "Bearer ", solo el token)',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Auth', 'Autenticación y registro de usuarios')
    .addTag('Users', 'Gestión de usuarios del sistema')
    .addTag('Organizations', 'Gestión de organizaciones/escuelas')
    .addTag('Topics', 'Gestión de contenido educativo')
    .addTag('Quizzes', 'Sistema de evaluación con preguntas y respuestas')
    .addTag('Quiz-Sets', 'Conjuntos de quizzes agrupados por tema')
    .addTag('Scores', 'Puntuaciones y rankings de usuarios')
    .addTag('Resultados', 'Resultados de quizzes completados')
    .addTag('Juegos', 'Juegos educativos (Ahorcado y Memorama)')
    .addServer('http://localhost:3000', 'Servidor de Desarrollo')
    .addServer('https://api.cibereduca.com', 'Servidor de Producción')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'CiberEduca API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { font-size: 36px }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎓 CiberEduca API - Sistema de Gestión Educativa        ║
  ║                                                           ║
  ║   🚀 Servidor corriendo en: http://localhost:${port}         ║
  ║   📚 Documentación Swagger: http://localhost:${port}/api     ║
  ║                                                           ║
  ║   Versión: 1.0.0                                          ║
  ║   Entorno: ${process.env.NODE_ENV || 'development'}                                    ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
