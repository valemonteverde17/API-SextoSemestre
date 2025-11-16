import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type ScoreDocument = HydratedDocument<Score>;

@Schema({ timestamps: true })
export class Score {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuizSet', required: true })
  quiz_set_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Topics', required: true })
  topic_id: Types.ObjectId;

  @Prop({ required: true })
  score: number; // Puntaje obtenido (0-100)

  @Prop({ required: true })
  total_questions: number; // Total de preguntas del quiz

  @Prop({ required: true })
  correct_answers: number; // Respuestas correctas

  @Prop({ required: true })
  time_taken: number; // Tiempo en segundos

  @Prop({ default: Date.now })
  completed_at: Date; // Fecha de completado

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);

// Índice único para user_id + quiz_set_id (un puntaje por quiz por usuario)
ScoreSchema.index({ user_id: 1, quiz_set_id: 1 }, { unique: true });
