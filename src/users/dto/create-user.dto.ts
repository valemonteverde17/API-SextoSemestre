import { ApiProperty,ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, Matches, IsMongoId, IsOptional} from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "Unique username",
    example: "john_doe",
    uniqueItems: true
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  user_name: string;

  @ApiProperty({
    description: "User password (min 8 characters)",
    example: "securePassword123",
    minLength: 8
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: "Role ID reference (optional)",
    example: "507f1f77bcf86cd799439011"
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  role_id?: string;

  /*@ApiProperty({
    description: "Role ID reference",
    example: "507f1f77bcf86cd799439011"
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role_id: string;*/
  
}

