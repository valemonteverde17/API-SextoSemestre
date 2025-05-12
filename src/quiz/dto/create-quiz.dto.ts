import { IsNotEmpty, IsString, IsArray, IsMongoId } from 'class-validator';

export class CreateQuizDto {
  @IsNotEmpty() @IsString() question: string;
  @IsArray() options: string[];
  @IsString() correctAnswer: string;
  @IsMongoId() topic_id: string;
}

