import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsMongoId } from 'class-validator';

export class UpdateTopicDto {
  @ApiProperty({
    required: false,
    description: 'nombre'
  })
  @IsOptional()
  @IsString()
  topic_name?: string;

  @ApiProperty({
    required: false,
    description: 'descripcion',
    minLength: 10
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({
    required: false,
    description: 'referencia a ID categoria'
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  category_id?: string;
}