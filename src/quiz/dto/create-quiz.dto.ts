import { IsNotEmpty, IsString, IsArray, IsMongoId, IsOptional, IsNumber } from 'class-validator';

export class CreateQuizDto {
  @IsNotEmpty() @IsString() question: string;
  @IsArray() options: string[];
  @IsString() correctAnswer: string;
  @IsMongoId() topic_id: string;
  @IsOptional() @IsMongoId() quiz_set_id?: string;
  @IsOptional() @IsNumber() order?: number;
}

