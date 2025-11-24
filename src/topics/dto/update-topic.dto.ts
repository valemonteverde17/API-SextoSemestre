import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsMongoId, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentBlockDto } from './create-topic.dto';

export class UpdateTopicDto {
  @ApiPropertyOptional({ description: 'nombre' })
  @IsOptional()
  @IsString()
  topic_name?: string;

  @ApiPropertyOptional({ description: 'descripcion', minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ description: 'referencia a ID categoria' })
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

  @ApiPropertyOptional({
    description: 'Color de la card del tema',
    example: '#2b9997'
  })
  @IsOptional()
  @IsString()
  cardColor?: string;

  @ApiPropertyOptional({
    description: 'Tags del tema',
    example: ['seguridad', 'contraseñas'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Dificultad del tema',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced']
  })
  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Estado del tema',
    example: 'draft',
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'editing', 'deleted']
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'pending_approval', 'approved', 'rejected', 'editing', 'deleted'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Visibilidad del tema',
    example: 'public',
    enum: ['public', 'organization', 'private']
  })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'organization', 'private'])
  visibility?: string;
}