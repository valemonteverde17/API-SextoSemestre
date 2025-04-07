import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsMongoId } from 'class-validator';

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

  @ApiProperty({
    required: false,
    description: 'Role ID reference (optional)'
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  role_id?: string;
}
