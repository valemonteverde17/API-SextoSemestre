import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScoreDto {
  @ApiProperty({ 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ 
    description: 'ID del conjunto de quizzes',
    example: '673set123def456789012345'
  })
  @IsNotEmpty()
  @IsString()
  quiz_set_id: string;

  @ApiProperty({ 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @IsNotEmpty()
  @IsString()
  topic_id: string;

  @ApiProperty({ 
    description: 'Puntuación obtenida (0-100)',
    example: 95,
    minimum: 0,
    maximum: 100
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ 
    description: 'Total de preguntas del quiz',
    example: 10,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  total_questions: number;

  @ApiProperty({ 
    description: 'Número de respuestas correctas',
    example: 9,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  correct_answers: number;

  @ApiProperty({ 
    description: 'Tiempo tomado en segundos',
    example: 180,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  time_taken: number;
}
