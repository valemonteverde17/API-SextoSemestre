import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Hangman extends Document {
  @Prop({ required: true })
  topic_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  word: string;

  @Prop({ required: false })
  hint?: string;

  @Prop({ default: false })
  is_deleted?: boolean;

  @Prop()
  deleted_at?: Date;

  @Prop({ required: false })
  deleted_by?: string;
}

export const HangmanSchema = SchemaFactory.createForClass(Hangman);
