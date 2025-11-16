import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TopicsDocument = HydratedDocument<Topics>;

export interface BlockStyle {
  color?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha';
  backgroundColor?: string;
  codeLanguage?: string;
  codeTheme?: 'dark' | 'light';
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'list' | 'code' | 'quote' | 'code-static' | 'code-live';
  content: string;
  order: number;
  style?: BlockStyle;
  htmlContent?: string;
  cssContent?: string;
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