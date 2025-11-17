import { IsMongoId, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResultDto {
  @ApiProperty({ 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @IsMongoId() 
  user_id: string;

  @ApiProperty({ 
    description: 'ID del quiz (pregunta)',
    example: '673quiz123def456789012345'
  })
  @IsMongoId() 
  quiz_id: string;

  @ApiProperty({ 
    description: 'Respuesta seleccionada por el usuario',
    example: 'París'
  })
  @IsString() 
  selectedAnswer: string;

  @ApiProperty({ 
    description: 'Indica si la respuesta es correcta',
    example: true
  })
  @IsBoolean() 
  isCorrect: boolean;
}
