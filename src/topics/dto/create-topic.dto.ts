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

  /*@ApiProperty({
    description: "Role ID reference",
    example: "507f1f77bcf86cd799439011"
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role_id: string;*/

}