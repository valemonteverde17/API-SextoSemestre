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
  type: 'text' | 'heading' | 'list' | 'quote' | 'code-static' | 'code-live';
  content: string;
  order: number;
  style?: BlockStyle;
  htmlContent?: string;
  showCode?: boolean;
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

  @Prop({ default: '#2b9997' })
  cardColor?: string;

  // AUTOR Y ORGANIZACIÓN
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false })
  organization_id?: Types.ObjectId;

  // ESTADO Y APROBACIÓN
  @Prop({ 
    required: true,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  })
  status: string;

  // VISIBILIDAD
  @Prop({ 
    required: true,
    enum: ['public', 'organization', 'private'],
    default: 'public'
  })
  visibility: string;

  // REVISIÓN
  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  reviewed_by?: Types.ObjectId;

  @Prop()
  reviewed_at?: Date;

  @Prop()
  review_comments?: string;

  // VERSIONES Y EDICIÓN
  @Prop({ default: 1 })
  version: number;

  @Prop({ default: true })
  is_editing: boolean;

  // METADATA ADICIONAL
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], required: false })
  difficulty?: string;

  @Prop()
  publishedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TopicsSchema = SchemaFactory.createForClass(Topics);