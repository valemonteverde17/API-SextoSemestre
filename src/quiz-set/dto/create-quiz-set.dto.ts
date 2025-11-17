import { IsString, IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizSetDto {
  @ApiProperty({ 
    description: 'Nombre del conjunto de quizzes',
    example: 'Evaluación de JavaScript Básico'
  })
  @IsString()
  quiz_name: string;

  @ApiPropertyOptional({ 
    description: 'Descripción del conjunto (opcional)',
    example: 'Conjunto de preguntas sobre conceptos básicos de JavaScript'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'ID del topic al que pertenece el conjunto',
    example: '673abc123def456789012345'
  })
  @IsMongoId()
  topic_id: string;

  @ApiPropertyOptional({ 
    description: 'Indica si el conjunto está activo (opcional, default: true)',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
