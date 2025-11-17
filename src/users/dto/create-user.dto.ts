import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsIn, MinLength, Matches, IsMongoId, IsOptional, IsEmail, IsObject, ValidateNested, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UserProfileDto {
  @ApiPropertyOptional({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'URL del avatar', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Biografía del usuario', example: 'Profesor de matemáticas' })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UserPermissionsDto {
  @ApiPropertyOptional({ description: 'Puede revisar contenido', default: false })
  @IsOptional()
  @IsBoolean()
  canReview?: boolean;

  @ApiPropertyOptional({ description: 'Puede gestionar usuarios', default: false })
  @IsOptional()
  @IsBoolean()
  canManageUsers?: boolean;
}

export class CreateUserDto {
  @ApiProperty({
    description: "Nombre de usuario único",
    example: "john_doe",
    uniqueItems: true
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  user_name: string;

  @ApiProperty({
    description: "Contraseña del usuario (mínimo 8 caracteres)",
    example: "securePassword123",
    minLength: 8
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: "Email del usuario",
    example: "usuario@example.com"
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: "Rol del usuario",
    example: "estudiante",
    enum: ['admin', 'revisor', 'docente', 'estudiante']
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'revisor', 'docente', 'estudiante'], { 
    message: 'Role must be one of: admin, revisor, docente, estudiante' 
  })
  role: string;

  @ApiPropertyOptional({
    description: "ID de la organización (opcional, para usuarios de organizaciones)",
    example: "507f1f77bcf86cd799439011"
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  organization_id?: string;

  @ApiPropertyOptional({
    description: "Estado del usuario",
    example: "active",
    enum: ['active', 'pending', 'suspended', 'rejected'],
    default: 'active'
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'pending', 'suspended', 'rejected'])
  status?: string;

  @ApiPropertyOptional({
    description: "Perfil del usuario",
    type: UserProfileDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;

  @ApiPropertyOptional({
    description: "Permisos especiales del usuario",
    type: UserPermissionsDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  permissions?: UserPermissionsDto;

  @ApiPropertyOptional({
    description: "ID del usuario que creó este usuario (para auditoría)",
    example: "507f1f77bcf86cd799439011"
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  createdBy?: string;
}

