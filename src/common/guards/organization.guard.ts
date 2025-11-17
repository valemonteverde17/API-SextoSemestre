import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard para verificar que el usuario pertenezca a la organización
 * Útil para endpoints que requieren que el usuario sea miembro de una organización específica
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    const body = request.body;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Si el usuario es admin global, permitir acceso
    if (user.role === 'admin' && !user.organization_id) {
      return true;
    }

    // Obtener el organization_id del recurso (puede venir de params, body o query)
    const resourceOrgId = params.organizationId || body.organization_id || request.query.organization_id;

    // Si no hay organization_id en el recurso, verificar que el usuario tenga organización
    if (!resourceOrgId) {
      // Permitir si el usuario no tiene organización (usuario independiente)
      return true;
    }

    // Verificar que el usuario pertenezca a la misma organización
    if (user.organization_id && user.organization_id.toString() !== resourceOrgId.toString()) {
      throw new ForbiddenException('No tienes permiso para acceder a recursos de otra organización');
    }

    return true;
  }
}
