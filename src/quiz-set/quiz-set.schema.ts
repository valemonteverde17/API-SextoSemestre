import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizSetDocument = HydratedDocument<QuizSet>;

@Schema({ timestamps: true })
export class QuizSet {
  @Prop({ required: true })
  quiz_name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Topics', required: true })
  topic_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  created_by?: Types.ObjectId;

  @Prop({ default: false })
  is_deleted?: boolean;

  @Prop()
  deleted_at?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  deleted_by?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const QuizSetSchema = SchemaFactory.createForClass(QuizSet);
