import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoramaDocument = Memorama & Document;

@Schema({ timestamps: true })
export class Memorama {
  @Prop({ type: Types.ObjectId, ref: 'Topics', required: true })
  topic_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  concept: string; // Concepto principal (ej: "Phishing")

  @Prop({ required: true })
  definition: string; // Definición (ej: "Estafa digital con correos falsos")

  @Prop({ default: 'easy', enum: ['easy', 'medium', 'hard'] })
  difficulty: string;

  @Prop({ default: true })
  isActive: boolean;

  // NUEVOS CAMPOS DE CONTROL
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false })
  organization_id?: Types.ObjectId;

  @Prop({ 
    required: true,
    enum: ['draft', 'pending_review', 'approved', 'rejected'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  reviewed_by?: Types.ObjectId;

  @Prop()
  reviewed_at?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MemoramaSchema = SchemaFactory.createForClass(Memorama);
