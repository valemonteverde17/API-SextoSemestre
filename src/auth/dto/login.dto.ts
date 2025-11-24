import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nombre de usuario o email',
    example: 'admin',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  user_name: string; // Acepta username o email

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Admin123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
