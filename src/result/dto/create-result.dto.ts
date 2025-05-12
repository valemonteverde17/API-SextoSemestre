import { IsMongoId, IsString, IsBoolean } from 'class-validator';

export class CreateResultDto {
  @IsMongoId() user_id: string;
  @IsMongoId() quiz_id: string;
  @IsString() selectedAnswer: string;
  @IsBoolean() isCorrect: boolean;
}
