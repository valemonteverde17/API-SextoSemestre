import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString, MinLength, IsMongoId } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    description: 'New password (optional)',
    minLength: 8
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['docente', 'estudiante'], { message: 'Role must be either "docente" or "estudiante"' })
  role?: string;
}
