import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateScoreDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  quiz_set_id: string;

  @IsNotEmpty()
  @IsString()
  topic_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  total_questions: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  correct_answers: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  time_taken: number;
}
