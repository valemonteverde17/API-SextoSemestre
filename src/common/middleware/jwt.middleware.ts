import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * Middleware para extraer y validar JWT tokens
 * Agrega el usuario decodificado a request.user si el token es válido
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remover 'Bearer '
      
      try {
        // Verificar y decodificar el token
        const secret = this.configService.get<string>('JWT_SECRET') || 'cibereduca-secret-key-2024';
        const decoded = jwt.verify(token, secret);
        
        // Agregar usuario a la request
        req['user'] = decoded;
      } catch (error) {
        // Token inválido o expirado - continuar sin usuario
        // Los Guards se encargarán de rechazar si es necesario
        console.log('JWT verification failed:', error.message);
      }
    }
    
    next();
  }
}
