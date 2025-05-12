
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema({ timestamps: true })
export class Users {
  @Prop({ unique: true, required: true })
  user_name: string;

  @Prop({ required: true, select: false }) // select: false para que no se devuelva en consultas por defecto
  password: string;

  @Prop({ required: true, enum: ['docente', 'estudiante'] })
  role: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);