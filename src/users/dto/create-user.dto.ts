import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  user_name: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Role ID reference (optional)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['docente', 'estudiante'], {
    message: 'Role must be either "docente" or "estudiante"',
  })
  role: string;
}
