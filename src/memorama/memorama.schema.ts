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
}

export const MemoramaSchema = SchemaFactory.createForClass(Memorama);
