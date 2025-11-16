import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TopicsDocument = HydratedDocument<Topics>;

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'list' | 'code' | 'quote';
  content: string;
  order: number;
}

@Schema({ timestamps: true })
export class Topics {
  @Prop({ unique: true, required: true })
  topic_name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Object], default: [] })
  content?: ContentBlock[];

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  category_id?: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TopicsSchema = SchemaFactory.createForClass(Topics);