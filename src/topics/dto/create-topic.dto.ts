import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsMongoId, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class BlockStyleDto {
  @ApiPropertyOptional({ example: '#2b9997' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'medium', enum: ['small', 'medium', 'large', 'xlarge'] })
  @IsOptional()
  @IsString()
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';

  @ApiPropertyOptional({ example: 'normal', enum: ['normal', 'bold'] })
  @IsOptional()
  @IsString()
  fontWeight?: 'normal' | 'bold';

  @ApiPropertyOptional({ example: 'normal', enum: ['normal', 'italic'] })
  @IsOptional()
  @IsString()
  fontStyle?: 'normal' | 'italic';

  @ApiPropertyOptional({ example: 'left', enum: ['left', 'center', 'right', 'justify'] })
  @IsOptional()
  @IsString()
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  @ApiPropertyOptional({ example: 'disc', enum: ['disc', 'circle', 'square', 'decimal', 'lower-alpha', 'upper-alpha'] })
  @IsOptional()
  @IsString()
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha';

  @ApiPropertyOptional({ example: '#f8f9fa' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ example: 'javascript' })
  @IsOptional()
  @IsString()
  codeLanguage?: string;

  @ApiPropertyOptional({ example: 'dark', enum: ['dark', 'light'] })
  @IsOptional()
  @IsString()
  codeTheme?: 'dark' | 'light';
}

export class ContentBlockDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'text', enum: ['text', 'heading', 'list', 'quote', 'code-static', 'code-live'] })
  @IsString()
  type: 'text' | 'heading' | 'list' | 'quote' | 'code-static' | 'code-live';

  @ApiProperty({ example: 'Contenido del bloque' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ type: BlockStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BlockStyleDto)
  style?: BlockStyleDto;

  @ApiPropertyOptional({ example: '<!DOCTYPE html>...' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  showCode?: boolean;
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

  @ApiPropertyOptional({
    description: 'Color de la card del tema',
    example: '#2b9997'
  })
  @IsOptional()
  @IsString()
  cardColor?: string;
}