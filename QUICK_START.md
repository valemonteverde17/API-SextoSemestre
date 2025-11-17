# ⚡ Quick Start - CiberEduca API

Guía rápida para poner en marcha la API en menos de 5 minutos.

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar e Instalar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/cibereduca-api.git
cd cibereduca-api/API-SextoSemestre

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
# Mínimo requerido:
# - MONGO_URI (tu conexión a MongoDB)
# - JWT_SECRET (clave secreta)
```

**Ejemplo de `.env` mínimo:**

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cibereduca
JWT_SECRET=mi_clave_super_secreta_123
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### 3. Iniciar MongoDB

```bash
# Opción A: MongoDB local
mongod

# Opción B: MongoDB Atlas
# Solo necesitas la URI en MONGO_URI
```

### 4. Crear el Primer Administrador

```bash
npm run create-admin
```

Este comando creará automáticamente un admin con:
- **Username:** `admin`
- **Password:** `Admin123!`
- **Email:** `admin@cibereduca.com`

**⚠️ Importante:** Cambia la contraseña después del primer login.

### 5. Ejecutar la API

```bash
npm run start:dev
```

**✅ Listo!** La API está corriendo en `http://localhost:3000`

---

## 📚 Acceder a la Documentación

Abre tu navegador en:

```
http://localhost:3000/api
```

Verás la documentación interactiva Swagger con:
- ✅ Todos los endpoints
- ✅ Ejemplos de request/response
- ✅ Posibilidad de probar la API directamente

---

## 👤 Usar tu Usuario Admin

### Login con las Credenciales Creadas

Usa Swagger o Postman para hacer login:

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "user_name": "admin",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "673abc123...",
    "user_name": "admin",
    "role": "admin",
    "status": "active"
  }
}
```

**Guarda el `access_token`** para usarlo en las siguientes peticiones.

---

## 🔐 Métodos Alternativos para Crear Admin

Si el script no funcionó o prefieres otro método:

### Opción A: Vía MongoDB Compass

1. Conecta a tu base de datos
2. Selecciona la colección `users`
3. Inserta este documento:

```json
{
  "user_name": "admin",
  "password": "$2b$10$TU_HASH_AQUI",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active",
  "profile": {
    "fullName": "Administrador"
  },
  "permissions": {
    "canReview": false,
    "canManageUsers": true
  },
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Nota**: Genera el hash del password con:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(console.log)"
```

---

## 🧪 Probar la API

### 1. Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "user_name": "admin",
  "password": "Admin123!"
}
```

**Guarda el `access_token` de la respuesta.**

### 2. Obtener Perfil

```http
GET http://localhost:3000/auth/profile
Authorization: Bearer TU_TOKEN_AQUI
```

### 3. Listar Usuarios

```http
GET http://localhost:3000/users
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 📖 Siguiente Paso

Ahora que tienes la API funcionando, consulta:

1. **[README.md](./README.md)** - Documentación completa
2. **[Swagger UI](http://localhost:3000/api)** - Documentación interactiva
3. **[Guías de Testing](../TESTING_1_SETUP_INICIAL.md)** - Testing con Postman

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solución:**
- Verifica que MongoDB esté corriendo: `mongod`
- Verifica la URI en `.env`
- Si usas Atlas, verifica que tu IP esté en la whitelist

### Error: "JWT_SECRET is not defined"

**Solución:**
- Verifica que `.env` exista
- Verifica que `JWT_SECRET` esté definido en `.env`
- Reinicia el servidor

### Error: "Port 3000 is already in use"

**Solución:**
- Cambia el puerto en `.env`: `PORT=3001`
- O mata el proceso: `npx kill-port 3000`

### Error: "Module not found"

**Solución:**
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Comandos Útiles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test

# Linting
npm run lint

# Formatear código
npm run format
```

---

## 📧 ¿Necesitas Ayuda?

- **Documentación**: [README.md](./README.md)
- **Swagger**: http://localhost:3000/api
- **Issues**: GitHub Issues
- **Email**: soporte@cibereduca.com

---

**¡Listo para comenzar! 🚀**
