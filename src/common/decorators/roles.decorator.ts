import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para especificar los roles permitidos en un endpoint
 * @param roles - Array de roles permitidos ('admin', 'revisor', 'docente', 'estudiante')
 * 
 * @example
 * @Roles('admin', 'revisor')
 * @Get('pending-review')
 * getPendingReview() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
