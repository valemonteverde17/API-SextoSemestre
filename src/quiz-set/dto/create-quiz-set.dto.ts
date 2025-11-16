import { IsString, IsOptional, IsMongoId, IsBoolean } from 'class-validator';

export class CreateQuizSetDto {
  @IsString()
  quiz_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  topic_id: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
