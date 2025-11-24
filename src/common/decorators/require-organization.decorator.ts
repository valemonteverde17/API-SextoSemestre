import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para requerir que el usuario pertenezca a una organización
 * 
 * @example
 * @RequireOrganization()
 * @Get('organization-only')
 * getOrganizationData() { ... }
 */
export const RequireOrganization = () => SetMetadata('requireOrganization', true);
