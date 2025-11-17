# 🤝 Guía de Contribución - CiberEduca API

¡Gracias por tu interés en contribuir a CiberEduca! Este proyecto es open source y está disponible para la comunidad educativa.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)
- [Pull Requests](#pull-requests)
- [Guías de Estilo](#guías-de-estilo)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

### Nuestros Valores

- 🤝 Respeto mutuo
- 💡 Colaboración abierta
- 📚 Compartir conocimiento
- 🎓 Enfoque en la educación

---

## 🚀 Cómo Contribuir

### 1. Fork del Proyecto

```bash
# Haz fork desde GitHub
# Luego clona tu fork
git clone https://github.com/TU-USUARIO/cibereduca-api.git
cd cibereduca-api/API-SextoSemestre
```

### 2. Crea una Rama

```bash
# Crea una rama para tu feature/fix
git checkout -b feature/mi-nueva-feature

# O para un bugfix
git checkout -b fix/descripcion-del-bug
```

### 3. Realiza tus Cambios

- Escribe código limpio y bien documentado
- Sigue las guías de estilo del proyecto
- Agrega tests si es necesario
- Actualiza la documentación

### 4. Commit tus Cambios

```bash
# Usa commits descriptivos
git add .
git commit -m "feat: agregar endpoint de estadísticas de usuarios"

# O para bugfixes
git commit -m "fix: corregir validación de email en registro"
```

**Formato de Commits:**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma, etc (sin cambios de código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/mi-nueva-feature

# Luego crea un Pull Request en GitHub
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado ya
2. Asegúrate de estar usando la última versión
3. Intenta reproducir el bug en un ambiente limpio

### Cómo Reportar

Crea un issue en GitHub con:

**Título:** Descripción breve del bug

**Descripción:**
```markdown
## Descripción del Bug
[Descripción clara del problema]

## Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué está pasando]

## Screenshots
[Si aplica]

## Entorno
- OS: [ej. Windows 11]
- Node: [ej. 18.17.0]
- MongoDB: [ej. 6.0.5]
- Navegador: [ej. Chrome 120]

## Logs
```
[Logs relevantes]
```
```

---

## 💡 Sugerir Features

### Antes de Sugerir

1. Verifica que la feature no exista ya
2. Revisa los issues abiertos
3. Considera si es útil para la comunidad educativa

### Cómo Sugerir

Crea un issue con:

**Título:** [FEATURE] Descripción breve

**Descripción:**
```markdown
## Problema que Resuelve
[Qué problema o necesidad aborda]

## Solución Propuesta
[Cómo funcionaría la feature]

## Alternativas Consideradas
[Otras opciones que consideraste]

## Beneficios
- Beneficio 1
- Beneficio 2

## Casos de Uso
1. Caso de uso 1
2. Caso de uso 2
```

---

## 🔄 Pull Requests

### Checklist antes de Enviar

- [ ] El código compila sin errores
- [ ] Los tests pasan (`npm run test`)
- [ ] El código sigue las guías de estilo
- [ ] La documentación está actualizada
- [ ] Los commits son descriptivos
- [ ] No hay conflictos con `main`

### Proceso de Review

1. Un maintainer revisará tu PR
2. Puede haber comentarios o solicitudes de cambios
3. Realiza los cambios solicitados
4. Una vez aprobado, se hará merge

### Qué Incluir en el PR

```markdown
## Descripción
[Descripción de los cambios]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Cómo Probar
1. Paso 1
2. Paso 2

## Screenshots
[Si aplica]

## Checklist
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Código revisado
```

---

## 📐 Guías de Estilo

### TypeScript

```typescript
// ✅ Bueno
export class UserService {
  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }
}

// ❌ Malo
export class UserService {
  async findById(id) {
    return this.userModel.findById(id);
  }
}
```

### Naming Conventions

- **Clases**: PascalCase (`UserService`, `AuthController`)
- **Funciones**: camelCase (`findById`, `createUser`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_VERSION`)
- **Interfaces**: PascalCase con prefijo I opcional (`IUser`, `User`)
- **Archivos**: kebab-case (`user.service.ts`, `auth.controller.ts`)

### Documentación con Swagger

```typescript
@ApiOperation({ 
  summary: 'Crear usuario',
  description: 'Descripción detallada del endpoint'
})
@ApiResponse({
  status: 201,
  description: 'Usuario creado exitosamente',
  schema: { example: { ... } }
})
@ApiResponse({
  status: 400,
  description: 'Datos inválidos'
})
async create(@Body() dto: CreateUserDto) {
  // ...
}
```

### DTOs

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'john_doe',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  user_name: string;
}
```

### Tests

```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const dto = { user_name: 'test', password: 'test123' };
    const result = await service.create(dto);
    expect(result).toBeDefined();
    expect(result.user_name).toBe('test');
  });
});
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── auth/                    # Autenticación
│   ├── auth.controller.ts   # Endpoints de auth
│   ├── auth.service.ts      # Lógica de auth
│   ├── auth.module.ts       # Módulo de auth
│   └── dto/                 # DTOs de auth
├── users/                   # Usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.schema.ts      # Schema de Mongoose
│   └── dto/
├── topics/                  # Contenido educativo
├── organization/            # Organizaciones
├── common/                  # Recursos compartidos
│   ├── guards/             # Guards de autorización
│   ├── decorators/         # Decoradores custom
│   ├── middleware/         # Middleware
│   └── services/           # Servicios compartidos
└── main.ts                 # Entry point
```

### Agregar un Nuevo Módulo

```bash
# Generar módulo con NestJS CLI
nest g module nombre-modulo
nest g controller nombre-modulo
nest g service nombre-modulo

# Estructura resultante:
src/nombre-modulo/
├── nombre-modulo.controller.ts
├── nombre-modulo.service.ts
├── nombre-modulo.module.ts
└── dto/
    └── create-nombre.dto.ts
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Escribir Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    // Test implementation
  });
});
```

---

## 📚 Recursos Útiles

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [Jest Testing](https://jestjs.io/docs/getting-started)

---

## ❓ Preguntas Frecuentes

### ¿Cómo empiezo a contribuir?

1. Busca issues etiquetados como `good first issue`
2. Lee la documentación del proyecto
3. Configura tu ambiente de desarrollo
4. Haz un pequeño cambio y crea un PR

### ¿Qué puedo contribuir?

- Corrección de bugs
- Nuevas features
- Mejoras en documentación
- Tests
- Traducciones
- Ejemplos de uso

### ¿Cuánto tiempo toma el review?

Generalmente 1-3 días. Si no hay respuesta en una semana, puedes hacer un comentario amable recordando.

---

## 🙏 Agradecimientos

Gracias a todos los contribuidores que hacen posible este proyecto.

### Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Aquí se listarán los contribuidores -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📧 Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/cibereduca-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/cibereduca-api/discussions)
- **Email**: dev@cibereduca.com

---

<p align="center">
  ¡Gracias por contribuir a la educación! 🎓
</p>
