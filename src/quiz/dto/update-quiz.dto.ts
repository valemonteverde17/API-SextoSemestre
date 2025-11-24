import { IsOptional, IsString, IsArray, IsMongoId } from 'class-validator';

export class UpdateQuizDto {
  @IsOptional() @IsString() question?: string;
  @IsOptional() @IsArray() options?: string[];
  @IsOptional() @IsString() correctAnswer?: string;
  @IsOptional() @IsMongoId() topic_id?: string;
}
