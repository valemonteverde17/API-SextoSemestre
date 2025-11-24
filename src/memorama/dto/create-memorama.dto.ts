import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateMemoramaDto {
  @ApiProperty({
    description: 'ID del tema',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  topic_id: string;

  @ApiProperty({
    description: 'ID del usuario creador',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  user_id: string;

  @ApiProperty({ description: 'Concepto principal', example: 'Phishing' })
  @IsNotEmpty()
  @IsString()
  concept: string;

  @ApiProperty({
    description: 'Definición del concepto',
    example: 'Estafa digital con correos falsos',
  })
  @IsNotEmpty()
  @IsString()
  definition: string;

  @ApiPropertyOptional({
    description: 'Nivel de dificultad',
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Si el par está activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
