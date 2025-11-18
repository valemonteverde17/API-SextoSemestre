import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

export interface UserProfile {
  fullName?: string;
  avatar?: string;
  bio?: string;
}

export interface UserPermissions {
  canReview: boolean;
  canManageUsers: boolean;
}

@Schema({ timestamps: true })
export class Users {
  @Prop({ unique: true, required: true })
  user_name: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ unique: true, required: true })
  email: string;

  // ROLES: admin, revisor, docente, estudiante
  @Prop({ 
    required: true, 
    enum: ['admin', 'revisor', 'docente', 'estudiante'],
    default: 'estudiante'
  })
  role: string;

  // SUPER ADMIN (acceso total al sistema)
  @Prop({ 
    default: false 
  })
  is_super?: boolean;

  // ORGANIZACIÓN (null si es usuario independiente)
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false })
  organization_id?: Types.ObjectId;

  // ESTADO DEL USUARIO
  @Prop({ 
    required: true,
    enum: ['active', 'pending', 'suspended', 'rejected'],
    default: 'active'
  })
  status: string;

  // PERFIL
  @Prop({
    type: Object,
    default: {}
  })
  profile?: UserProfile;

  // PERMISOS ESPECIALES
  @Prop({
    type: Object,
    default: {
      canReview: false,
      canManageUsers: false
    }
  })
  permissions?: UserPermissions;

  // AUDITORÍA
  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  createdBy?: Types.ObjectId;  // Quién creó este usuario (si fue un admin)

  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  approvedBy?: Types.ObjectId;  // Quién aprobó este usuario

  @Prop()
  approvedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

// Índices para optimizar búsquedas
UsersSchema.index({ email: 1 });
UsersSchema.index({ user_name: 1 });
UsersSchema.index({ organization_id: 1 });
UsersSchema.index({ role: 1, status: 1 });