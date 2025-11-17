import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

export interface OrganizationSettings {
  allowPublicContent: boolean;  // Si estudiantes pueden ver contenido público
  requireApproval: boolean;     // Si requiere aprobación de contenido
}

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  code: string;  // Código único de la organización (ej: "EPB-001")

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  admin_id: Types.ObjectId;  // Usuario administrador de la organización

  @Prop()
  description?: string;

  @Prop()
  logo?: string;

  @Prop({
    type: Object,
    default: {
      allowPublicContent: true,
      requireApproval: true
    }
  })
  settings: OrganizationSettings;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
