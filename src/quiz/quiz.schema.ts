import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: [String] })
  options: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ type: Types.ObjectId, ref: 'Topics', required: true })
  topic_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuizSet', required: false })
  quiz_set_id?: Types.ObjectId;

  @Prop({ default: 0 })
  order?: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
