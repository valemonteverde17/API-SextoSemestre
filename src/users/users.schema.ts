import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema({ timestamps: true })
export class Users {
  @Prop({ unique: true, required: true })
  user_name: string;

  @Prop({ required: true, select: false }) // select: false para que no se devuelva en consultas por defecto
  password: string;

  @Prop({ required: true, enum: ['docente', 'estudiante', 'admin'] })
  role: string;

  @Prop({
    required: true,
    enum: ['pending', 'active', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop()
  last_login?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
