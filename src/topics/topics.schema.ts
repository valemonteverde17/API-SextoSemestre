import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TopicsDocument = HydratedDocument<Topics>;

export interface BlockStyle {
  color?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  listStyle?:
    | 'disc'
    | 'circle'
    | 'square'
    | 'decimal'
    | 'lower-alpha'
    | 'upper-alpha';
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

  @Prop({ type: Types.ObjectId, ref: 'Users', required: false })
  created_by?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }], default: [] })
  edit_permissions?: Types.ObjectId[];

  @Prop({
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'approved',
      'editing',
      'rejected',
      'deleted',
    ],
    default: 'draft',
  })
  status: string;

  @Prop({ default: false }) // Deprecated - usar status
  is_approved: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  edit_requested_by?: Types.ObjectId;

  @Prop()
  edit_requested_at?: Date;

  @Prop({ default: false })
  edit_request_pending: boolean;

  @Prop({ default: false })
  is_deleted?: boolean;

  @Prop()
  deleted_at?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  deleted_by?: Types.ObjectId;

  @Prop({
    type: [
      {
        date: Date,
        user: { type: Types.ObjectId, ref: 'Users' },
        action: String,
      },
    ],
    default: [],
  })
  history?: { date: Date; user: Types.ObjectId; action: string }[];

  @Prop({ default: '#2b9997' })
  cardColor?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TopicsSchema = SchemaFactory.createForClass(Topics);
