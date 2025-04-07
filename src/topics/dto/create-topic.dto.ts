import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsMongoId } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({
    description: 'nombre',
    example: 'ciberseguridad',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  topic_name: string;

  @ApiProperty({
    description: 'descripcion del tema',
    example: 'este tema trata sobre como hacer una contraseña fuerte',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría (opcional)',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  category_id?: string;
}