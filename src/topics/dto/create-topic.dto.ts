import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentBlockDto {
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'text', enum: ['text', 'heading', 'list', 'code', 'quote'] })
  @IsString()
  type: 'text' | 'heading' | 'list' | 'code' | 'quote';

  @ApiProperty({ example: 'Contenido del bloque' })
  @IsString()
  content: string;

  @ApiProperty({ example: 0 })
  order: number;
}

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

  @ApiPropertyOptional({
    description: 'Bloques de contenido del tema',
    type: [ContentBlockDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content?: ContentBlockDto[];
}