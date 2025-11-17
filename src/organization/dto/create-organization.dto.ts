import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId, MinLength, MaxLength } from 'class-validator';

export class OrganizationSettingsDto {
  @ApiPropertyOptional({ 
    description: 'Si los estudiantes pueden ver contenido público',
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  allowPublicContent?: boolean;

  @ApiPropertyOptional({ 
    description: 'Si el contenido requiere aprobación antes de publicarse',
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nombre de la organización',
    example: 'Escuela Primaria Benito Juárez'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Código único de la organización',
    example: 'EPB-001'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'ID del usuario administrador',
    example: '507f1f77bcf86cd799439011'
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  admin_id: string;

  @ApiPropertyOptional({
    description: 'Descripción de la organización',
    example: 'Escuela primaria ubicada en...'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la organización'
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Configuración de la organización',
    type: OrganizationSettingsDto
  })
  @IsOptional()
  settings?: OrganizationSettingsDto;
}
