import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para marcar un endpoint como público (sin autenticación requerida)
 * 
 * @example
 * @Public()
 * @Post('login')
 * login() { ... }
 */
export const Public = () => SetMetadata('isPublic', true);
