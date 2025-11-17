# 🔧 Solución: Autenticación en Swagger

## ❌ Problema Identificado

El token JWT se estaba enviando correctamente desde Swagger, pero el servidor lo rechazaba con error 401.

### Causa Raíz

Había una **inconsistencia en la configuración del JWT_SECRET**:
- El `AuthModule` usaba `process.env.JWT_SECRET` evaluado en tiempo de compilación
- El `JwtMiddleware` también usaba `process.env.JWT_SECRET` pero podía tener un valor diferente
- Esto causaba que los tokens generados no pudieran ser validados correctamente

## ✅ Solución Aplicada

### 1. Actualizado `auth.module.ts`

```typescript
// ANTES (incorrecto)
JwtModule.register({
  secret: process.env.JWT_SECRET || 'cibereduca-secret-key-2024',
  signOptions: { expiresIn: '24h' },
})

// DESPUÉS (correcto)
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET') || 'cibereduca-secret-key-2024',
    signOptions: {
      expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '24h') as any,
    },
  }),
  inject: [ConfigService],
})
```

### 2. Actualizado `jwt.middleware.ts`

```typescript
// ANTES (incorrecto)
const secret = process.env.JWT_SECRET || 'cibereduca-secret-key-2024';

// DESPUÉS (correcto)
constructor(private configService: ConfigService) {}

use(req: Request, res: Response, next: NextFunction) {
  const secret = this.configService.get<string>('JWT_SECRET') || 'cibereduca-secret-key-2024';
  // ...
}
```

## 🚀 Cómo Probar la Solución

### Paso 1: Reiniciar el Servidor

**IMPORTANTE**: Debes reiniciar el servidor para que los cambios surtan efecto.

```bash
# Detén el servidor actual (Ctrl+C)
# Luego inicia de nuevo:
npm run start:dev
```

### Paso 2: Probar en Swagger

1. Abre `http://localhost:3000/api`
2. Ve a `POST /auth/login`
3. Click "Try it out"
4. Ingresa credenciales:
   ```json
   {
     "user_name": "admin",
     "password": "Admin123!"
   }
   ```
5. Click "Execute"
6. **Copia el `access_token`** completo
7. Click en el botón **"Authorize" 🔓** (arriba a la derecha)
8. Pega el token en el campo "Value"
9. Click "Authorize"
10. Click "Close"

### Paso 3: Probar Endpoint Protegido

1. Ve a `GET /auth/profile`
2. Click "Try it out"
3. Click "Execute"
4. **Deberías ver tu perfil** (código 200) ✅

Si ves código 401, revisa los pasos siguientes.

## 🔍 Verificación de Problemas

### Si Sigue Sin Funcionar

#### 1. Verifica que el servidor se reinició
```bash
# Debes ver en la consola:
🎓 CiberEduca API - Sistema de Gestión Educativa
🚀 Servidor corriendo en: http://localhost:3000
```

#### 2. Verifica el archivo `.env`
```bash
# Asegúrate de que existe y tiene:
JWT_SECRET=cibereduca-secret-key-2024
JWT_EXPIRES_IN=24h
```

Si no tienes `.env`, créalo copiando `.env.example`:
```bash
cp .env.example .env
```

#### 3. Verifica la consola del servidor
Cuando hagas login, deberías ver en la consola del servidor:
- ✅ Sin errores = Token generado correctamente
- ❌ "JWT verification failed" = Problema con el secret

#### 4. Verifica el token en Swagger
En el botón "Authorize", después de pegar el token, deberías ver:
- ✅ "Authorized" en verde
- ❌ Si no aparece, el token no se guardó

## 📊 Flujo Correcto de Autenticación

```
1. Usuario → POST /auth/login → Servidor
2. Servidor genera token con JWT_SECRET
3. Usuario recibe access_token
4. Usuario pega token en "Authorize"
5. Swagger envía: Authorization: Bearer {token}
6. JwtMiddleware valida token con mismo JWT_SECRET
7. JwtMiddleware agrega user a request
8. AuthGuard verifica que user existe
9. ✅ Request autorizado
```

## 🎯 Diferencias Clave

### Antes (No Funcionaba)
- `process.env.JWT_SECRET` evaluado en diferentes momentos
- Posible inconsistencia entre generación y validación
- Token rechazado con 401

### Después (Funciona)
- `ConfigService` asegura mismo valor en toda la app
- Generación y validación usan mismo secret
- Token aceptado correctamente ✅

## 💡 Tips Adicionales

### Token Expirado
Si el token expira (después de 24h), simplemente:
1. Vuelve a hacer login
2. Copia el nuevo token
3. Actualiza en "Authorize"

### Múltiples Pestañas
Swagger guarda el token en localStorage, así que:
- ✅ Funciona en múltiples pestañas
- ✅ Persiste al recargar la página
- ❌ Se pierde al cerrar el navegador (por seguridad)

### Probar con Postman
Si prefieres Postman:
```
POST http://localhost:3000/auth/login
Body: { "user_name": "admin", "password": "Admin123!" }

Luego en otros requests:
Header: Authorization: Bearer {tu_token_aqui}
```

## ✅ Checklist de Verificación

- [ ] Servidor reiniciado después de los cambios
- [ ] Archivo `.env` existe con JWT_SECRET
- [ ] Login exitoso (código 200)
- [ ] Token copiado completo (sin espacios)
- [ ] Token pegado en "Authorize"
- [ ] Botón "Authorize" muestra "Authorized"
- [ ] Endpoint protegido responde 200 (no 401)

## 🆘 Si Nada Funciona

1. **Elimina node_modules y reinstala**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   npm run start:dev
   ```

2. **Verifica la versión de Node**:
   ```bash
   node --version  # Debe ser >= 16
   ```

3. **Revisa logs del servidor**:
   - Busca errores en rojo
   - Busca "JWT verification failed"
   - Busca "Usuario no autenticado"

4. **Prueba con curl**:
   ```bash
   # Login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"user_name":"admin","password":"Admin123!"}'
   
   # Copia el access_token y prueba:
   curl -X GET http://localhost:3000/auth/profile \
     -H "Authorization: Bearer TU_TOKEN_AQUI"
   ```

---

**¡Ahora Swagger debería funcionar perfectamente como un Postman en línea!** 🎉
