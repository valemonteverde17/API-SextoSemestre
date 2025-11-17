# 🎓 CiberEduca API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  API RESTful para la gestión de contenido educativo con sistema de roles y aprobación
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#tecnologías">Tecnologías</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#documentación">Documentación</a> •
  <a href="#testing">Testing</a> •
  <a href="#licencia">Licencia</a>
</p>

---

## 📋 Descripción

**CiberEduca API** es un sistema backend completo para la gestión de contenido educativo con control de acceso basado en roles (RBAC), flujos de aprobación y gestión de organizaciones educativas.

### ✨ Características Principales

- 🔐 **Autenticación JWT** - Sistema seguro de autenticación con tokens
- 👥 **Sistema de Roles** - Admin, Revisor, Docente, Estudiante
- 📝 **Gestión de Contenido** - Creación, edición y aprobación de topics educativos
- 🏢 **Organizaciones** - Gestión de escuelas e instituciones
- ✅ **Flujo de Aprobación** - Sistema completo de revisión y aprobación
- 📊 **Estados de Usuario** - Active, Pending, Suspended, Rejected
- 🔒 **Guards y Decoradores** - Protección granular de endpoints
- 📚 **Documentación Swagger** - API completamente documentada
- 🧪 **Testing Completo** - Guías detalladas de testing

---

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/) v10.x
- **Base de Datos**: [MongoDB](https://www.mongodb.com/) con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Lenguaje**: TypeScript

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x (local o cloud)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/cibereduca-api.git
cd cibereduca-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones (ver sección [Configuración](#configuración))

4. **Iniciar MongoDB**

```bash
# Si usas MongoDB local
mongod

# O usa MongoDB Atlas (cloud)
```

5. **Ejecutar la aplicación**

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000`

### 6. **Crear el Primer Administrador**

Antes de usar la API, necesitas crear el primer usuario administrador:

```bash
npm run create-admin
```

Este comando creará un admin con estas credenciales:
- **Username:** `admin`
- **Password:** `Admin123!`
- **Email:** `admin@cibereduca.com`

**⚠️ Importante:** Cambia la contraseña después del primer login.


### 7. **Probar la API con Swagger**

La API incluye documentación interactiva con Swagger UI:

```
http://localhost:3000/api
```

**📖 Guía completa:** Ver [COMO_USAR_SWAGGER.md](./COMO_USAR_SWAGGER.md)

**Inicio rápido:**
1. Abre `http://localhost:3000/api`
2. Haz login en `POST /auth/login` con las credenciales del admin
3. Copia el `access_token` de la respuesta
4. Haz clic en el botón **"Authorize"** 🔓 arriba a la derecha
5. Pega el token y haz clic en "Authorize"
6. ¡Ahora puedes probar todos los endpoints! 🎉

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
MONGO_URI=mongodb://localhost:27017/cibereduca

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### 📝 Descripción de Variables

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `PORT` | Puerto del servidor | `3000` | No (default: 3000) |
| `NODE_ENV` | Entorno de ejecución | `development`, `production` | No |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/cibereduca` | **Sí** |
| `JWT_SECRET` | Clave secreta para JWT | `mi_clave_super_secreta_123` | **Sí** |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h`, `7d`, `30d` | No (default: 24h) |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` | No |

### 🔒 Seguridad en Producción

**⚠️ IMPORTANTE**: Antes de desplegar en producción:

1. **Cambia `JWT_SECRET`** a una clave aleatoria y segura:
   ```bash
   # Generar clave segura
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Usa variables de entorno del sistema** (no archivos `.env`)

3. **Configura CORS** apropiadamente para tu dominio

4. **Usa HTTPS** en producción

5. **Configura MongoDB** con autenticación y SSL

---

## 📚 Documentación

### Swagger UI

Una vez que el servidor esté corriendo, accede a la documentación interactiva:

```
http://localhost:3000/api
```

La documentación Swagger incluye:
- ✅ Todos los endpoints disponibles
- ✅ Esquemas de request/response
- ✅ Ejemplos de uso
- ✅ Autenticación JWT integrada
- ✅ Prueba de endpoints en vivo

### Estructura del Proyecto

```
src/
├── auth/                 # Módulo de autenticación
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── users/                # Módulo de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.schema.ts
│   └── dto/
├── topics/               # Módulo de contenido educativo
│   ├── topics.controller.ts
│   ├── topics.service.ts
│   ├── topics.schema.ts
│   └── dto/
├── organization/         # Módulo de organizaciones
│   ├── organization.controller.ts
│   ├── organization.service.ts
│   └── organization.schema.ts
├── common/               # Recursos compartidos
│   ├── guards/          # Guards de autenticación y autorización
│   ├── decorators/      # Decoradores personalizados
│   ├── middleware/      # Middleware JWT
│   └── services/        # Servicios compartidos
└── app.module.ts         # Módulo principal
```

---

## 👥 Sistema de Roles

### Roles Disponibles

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **admin** | Control total | Gestiona usuarios, organizaciones y contenido |
| **revisor** | Revisión de contenido | Aprueba/rechaza topics educativos |
| **docente** | Creación de contenido | Crea y gestiona topics |
| **estudiante** | Consumo de contenido | Accede a contenido aprobado |

### Flujo de Aprobación de Usuarios

```
Registro → Estado Inicial
│
├─ Estudiante → active (automático)
│
├─ Docente (sin org) → pending → Admin aprueba → active
│
└─ Docente (con org) → active (si lo crea admin)
```

### Flujo de Aprobación de Contenido

```
Draft → Pending Review → Aprobado/Rechazado/Cambios Solicitados
  ↑                              │
  └──────────────────────────────┘
         (si se solicitan cambios)
```



## 🔑 Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil | Sí |
| POST | `/auth/verify` | Verificar token | Sí |

### Usuarios

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/users` | Listar usuarios | Admin/Revisor |
| GET | `/users/:id` | Obtener usuario | Autenticado |
| POST | `/users/approve/:id` | Aprobar usuario | Admin |
| POST | `/users/reject/:id` | Rechazar usuario | Admin |
| POST | `/users/suspend/:id` | Suspender usuario | Admin |

### Topics

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/topics` | Listar topics | Público |
| POST | `/topics` | Crear topic | Docente |
| POST | `/topics/:id/submit-review` | Enviar a revisión | Docente |
| POST | `/topics/:id/approve` | Aprobar topic | Admin/Revisor |
| POST | `/topics/:id/reject` | Rechazar topic | Admin/Revisor |

### Organizaciones

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/organizations` | Listar organizaciones | Admin |
| POST | `/organizations` | Crear organización | Admin |
| GET | `/organizations/:id` | Obtener organización | Admin |
| PATCH | `/organizations/:id` | Actualizar organización | Admin |

---

## 🚀 Despliegue

### Preparación para Producción

1. **Build del proyecto**
```bash
npm run build
```

2. **Variables de entorno**
```bash
# Configura las variables en tu servidor
export NODE_ENV=production
export MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
export JWT_SECRET=clave_super_segura_generada_aleatoriamente
```

3. **Ejecutar en producción**
```bash
npm run start:prod
```
---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📧 Soporte

- **Documentación**: [http://localhost:3000/api](http://localhost:3000/api)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/cibereduca-api/issues)
- **Email**: soporte@cibereduca.com

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework principal
- [MongoDB](https://www.mongodb.com/) - Base de datos
- Proyecto Universitario Educativo

---

<p align="center">
  Hecho con ❤️ para la educación
</p>
