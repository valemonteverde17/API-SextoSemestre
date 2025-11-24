import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topics, TopicsDocument } from '../../topics/topics.schema';

/**
 * Guard para verificar que el usuario sea el propietario del recurso
 * Verifica que el usuario que intenta modificar/eliminar sea el creador o colaborador
 * Admin siempre tiene acceso
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @InjectModel(Topics.name) private topicsModel: Model<TopicsDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Si es admin, permitir acceso
    if (user.role === 'admin') {
      return true;
    }

    // Obtener el ID del recurso
    const resourceId = params.id;
    if (!resourceId) {
      return true; // Si no hay ID, no es una operación de modificación
    }

    // Determinar el tipo de recurso basado en la ruta
    const path = request.route.path;
    
    if (path.includes('/topics')) {
      const topic = await this.topicsModel.findById(resourceId).exec();
      if (!topic) {
        throw new NotFoundException('Tema no encontrado');
      }

      // Verificar si es creador o colaborador
      const isOwner = topic.created_by?.toString() === user._id?.toString();
      const isCollaborator = topic.edit_permissions?.some(
        uid => uid.toString() === user._id?.toString()
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('Solo el creador o colaboradores pueden modificar este tema');
      }
    }

    // Aquí se pueden agregar más validaciones para otros tipos de recursos
    // (Quiz, Memorama, Hangman, etc.)

    return true;
  }
}
