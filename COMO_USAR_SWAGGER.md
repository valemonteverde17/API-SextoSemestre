# 🔧 Cómo Usar Swagger UI - Guía Rápida

## 📍 Acceso a Swagger

1. Inicia el servidor: `npm run start:dev`
2. Abre tu navegador en: `http://localhost:3000/api`

---

## 🔐 Autenticación en Swagger

### Paso 1: Obtener el Token JWT

1. Busca la sección **Auth** en Swagger
2. Expande el endpoint `POST /auth/login`
3. Haz clic en **"Try it out"**
4. Ingresa las credenciales del admin:
   ```json
   {
     "user_name": "admin",
     "password": "Admin123!"
   }
   ```
5. Haz clic en **"Execute"**
6. **Copia el `access_token`** de la respuesta (sin comillas)

### Paso 2: Autorizar en Swagger

1. Busca el botón **"Authorize" 🔓** en la parte superior derecha
2. Haz clic en él
3. Pega el token en el campo **"Value"** (solo el token, sin "Bearer ")
4. Haz clic en **"Authorize"**
5. Cierra el modal
6. ¡Listo! Ahora todos los endpoints protegidos funcionarán 🎉

---

## 📝 Probar Endpoints

### Endpoints Públicos (sin autenticación)
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /topics` - Ver topics públicos

### Endpoints Protegidos (requieren token)
- `GET /users` - Listar usuarios (admin/revisor)
- `POST /topics` - Crear topic (docente/admin)
- `GET /auth/profile` - Ver perfil

### Cómo Probar un Endpoint

1. **Expande el endpoint** que quieres probar
2. Haz clic en **"Try it out"**
3. **Modifica los parámetros** según necesites:
   - **Path params**: Aparecen en la URL (ej: `/users/{id}`)
   - **Query params**: Filtros opcionales (ej: `?role=docente`)
   - **Body**: Datos JSON para POST/PATCH
4. Haz clic en **"Execute"**
5. Revisa la **respuesta** en la sección "Responses"

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Listar Usuarios

```
1. Autorízate con el token (ver arriba)
2. Ve a: GET /users
3. Click "Try it out"
4. (Opcional) Agrega filtro: role = "docente"
5. Click "Execute"
6. Ver respuesta con lista de usuarios
```

### Ejemplo 2: Crear un Topic

```
1. Autorízate con el token
2. Ve a: POST /topics
3. Click "Try it out"
4. Usa el ejemplo pre-cargado o modifica el JSON
5. Click "Execute"
6. Ver respuesta con el topic creado
```

### Ejemplo 3: Aprobar un Usuario

```
1. Autorízate con el token (debe ser admin)
2. Ve a: POST /users/{id}/approve
3. Click "Try it out"
4. Ingresa el ID del usuario en el campo "id"
5. (Opcional) Agrega comentarios en el body
6. Click "Execute"
7. Ver respuesta de aprobación
```

---

## ⚠️ Problemas Comunes

### Error 401 Unauthorized
- **Causa**: Token no válido o expirado
- **Solución**: Vuelve a hacer login y actualiza el token en "Authorize"

### Error 403 Forbidden
- **Causa**: Tu rol no tiene permisos para ese endpoint
- **Solución**: Verifica que tu usuario tenga el rol correcto (admin, revisor, docente)

### Error 400 Bad Request
- **Causa**: Datos inválidos en el body
- **Solución**: Revisa el ejemplo y asegúrate de enviar todos los campos requeridos

### Error 404 Not Found
- **Causa**: El recurso (usuario, topic, etc.) no existe
- **Solución**: Verifica que el ID sea correcto

### No puedo modificar parámetros
- **Causa**: No hiciste clic en "Try it out"
- **Solución**: Siempre haz clic en "Try it out" antes de modificar

---

## 📊 Estructura de la Documentación

Cada endpoint muestra:

- **Summary**: Descripción corta
- **Description**: Explicación detallada
- **Parameters**: Parámetros requeridos/opcionales
- **Request Body**: Estructura del JSON a enviar
- **Responses**: Códigos de respuesta posibles con ejemplos
- **Security**: Si requiere autenticación (🔒)

---

## 🔄 Flujo Completo de Prueba

### 1. Autenticación
```
POST /auth/login → Obtener token → Authorize
```

### 2. Gestión de Usuarios
```
GET /users → Ver usuarios
POST /users/{id}/approve → Aprobar usuario
GET /users/{id} → Ver detalles
```

### 3. Gestión de Topics
```
POST /topics → Crear topic
GET /topics/my-topics → Ver mis topics
POST /topics/{id}/submit-review → Enviar a revisión
POST /topics/{id}/approve → Aprobar topic (admin)
GET /topics → Ver topics aprobados
```

### 4. Organizaciones
```
POST /organizations → Crear organización
GET /organizations → Listar organizaciones
GET /organizations/{id} → Ver detalles
```

---

## 💡 Tips

- ✅ **Persistencia**: Swagger guarda tu token automáticamente (no necesitas re-autenticarte cada vez)
- ✅ **Ejemplos**: Todos los endpoints tienen ejemplos pre-cargados
- ✅ **Filtros**: Usa la barra de búsqueda para encontrar endpoints rápidamente
- ✅ **Colapsar**: Haz clic en las secciones para colapsar/expandir
- ✅ **Copiar**: Puedes copiar los ejemplos de respuesta directamente

---

## 🚀 Inicio Rápido (3 pasos)

```bash
# 1. Inicia el servidor
npm run start:dev

# 2. Abre Swagger
http://localhost:3000/api

# 3. Autentica y prueba
POST /auth/login → Copiar token → Authorize → Probar endpoints
```

---

## 📞 Soporte

Si encuentras algún problema con Swagger:
1. Verifica que el servidor esté corriendo
2. Revisa la consola del navegador (F12)
3. Asegúrate de estar usando el token correcto
4. Consulta esta guía nuevamente

**¡Swagger es tu Postman en línea! 🎯**
