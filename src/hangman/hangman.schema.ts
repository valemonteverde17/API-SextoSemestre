import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Hangman extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Topics', required: true })
  topic_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  word: string;

  @Prop({ required: false })
  hint?: string;

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

export const HangmanSchema = SchemaFactory.createForClass(Hangman);
