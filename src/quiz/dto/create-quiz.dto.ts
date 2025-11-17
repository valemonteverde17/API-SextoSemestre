import { IsNotEmpty, IsString, IsArray, IsMongoId, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ 
    description: 'Pregunta del quiz',
    example: '¿Cuál es la capital de Francia?'
  })
  @IsNotEmpty() 
  @IsString() 
  question: string;

  @ApiProperty({ 
    description: 'Opciones de respuesta (array de strings)',
    example: ['Londres', 'París', 'Madrid', 'Roma'],
    type: [String]
  })
  @IsArray() 
  options: string[];

  @ApiProperty({ 
    description: 'Respuesta correcta (debe coincidir exactamente con una de las opciones)',
    example: 'París'
  })
  @IsString() 
  correctAnswer: string;

  @ApiProperty({ 
    description: 'ID del topic al que pertenece el quiz',
    example: '673abc123def456789012345'
  })
  @IsMongoId() 
  topic_id: string;

  @ApiPropertyOptional({ 
    description: 'ID del conjunto de quizzes (opcional)',
    example: '673set123def456789012345'
  })
  @IsOptional() 
  @IsMongoId() 
  quiz_set_id?: string;

  @ApiPropertyOptional({ 
    description: 'Orden del quiz en la lista (opcional)',
    example: 1
  })
  @IsOptional() 
  @IsNumber() 
  order?: number;

  @ApiPropertyOptional({ 
    description: 'ID del usuario creador (se asigna automáticamente)',
    example: '673user123def456789012345'
  })
  @IsOptional() 
  @IsMongoId() 
  created_by?: string;

  @ApiPropertyOptional({ 
    description: 'ID de la organización (opcional)',
    example: '673org123def456789012345'
  })
  @IsOptional() 
  @IsMongoId() 
  organization_id?: string;

  @ApiPropertyOptional({ 
    description: 'Estado del quiz',
    enum: ['draft', 'pending_review', 'approved', 'rejected'],
    example: 'draft'
  })
  @IsOptional()
  @IsEnum(['draft', 'pending_review', 'approved', 'rejected'])
  status?: string;
}

