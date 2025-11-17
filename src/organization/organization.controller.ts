import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('bearer')
@Controller('organizations')
@UseGuards(AuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Roles('admin')
  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva organización',
    description: 'Crea una nueva organización educativa (escuela, instituto, etc.) con un código único de invitación.'
  })
  @ApiBody({
    description: 'Datos de la organización a crear',
    type: CreateOrganizationDto,
    examples: {
      ejemplo1: {
        summary: 'Escuela Primaria',
        value: {
          name: 'Escuela Primaria Benito Juárez',
          code: 'EPB001',
          admin_id: '673abc123def456789012345',
          description: 'Escuela primaria pública ubicada en el centro de la ciudad',
          logo: 'https://example.com/logo-benito-juarez.png',
          settings: {
            allowPublicContent: true,
            requireApproval: true
          }
        }
      },
      ejemplo2: {
        summary: 'Escuela Secundaria',
        value: {
          name: 'Colegio Secundaria Miguel Hidalgo',
          code: 'CSMH002',
          admin_id: '673abc123def456789012345',
          description: 'Colegio de educación secundaria',
          settings: {
            allowPublicContent: false,
            requireApproval: true
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Organización creada exitosamente',
    schema: {
      example: {
        _id: '673org123def456789012345',
        name: 'Escuela Primaria Benito Juárez',
        code: 'EPB001',
        admin_id: '673abc123def456789012345',
        description: 'Escuela primaria pública ubicada en el centro de la ciudad',
        logo: 'https://example.com/logo-benito-juarez.png',
        settings: {
          allowPublicContent: true,
          requireApproval: true
        },
        createdAt: '2024-11-16T10:00:00.000Z',
        updatedAt: '2024-11-16T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'El código de organización ya existe' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ 
    summary: 'Listar todas las organizaciones',
    description: 'Obtiene la lista completa de organizaciones registradas en el sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de organizaciones obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '673org123def456789012345',
          name: 'Escuela Primaria Benito Juárez',
          code: 'EPB001',
          admin_id: {
            _id: '673abc123def456789012345',
            user_name: 'admin',
            role: 'admin'
          },
          description: 'Escuela primaria pública ubicada en el centro de la ciudad',
          settings: {
            allowPublicContent: true,
            requireApproval: true
          },
          createdAt: '2024-11-10T10:00:00.000Z',
          updatedAt: '2024-11-10T10:00:00.000Z'
        },
        {
          _id: '673org456def789012345678',
          name: 'Colegio Secundaria Miguel Hidalgo',
          code: 'CSMH002',
          admin_id: {
            _id: '673abc123def456789012345',
            user_name: 'admin',
            role: 'admin'
          },
          description: 'Colegio de educación secundaria',
          settings: {
            allowPublicContent: false,
            requireApproval: true
          },
          createdAt: '2024-11-05T08:00:00.000Z',
          updatedAt: '2024-11-05T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener organización por ID',
    description: 'Obtiene la información completa de una organización específica por su ID.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la organización',
    example: '673org123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organización encontrada',
    schema: {
      example: {
        _id: '673org123def456789012345',
        name: 'Escuela Primaria Benito Juárez',
        code: 'EPB001',
        admin_id: {
          _id: '673abc123def456789012345',
          user_name: 'admin',
          role: 'admin'
        },
        description: 'Escuela primaria pública ubicada en el centro de la ciudad',
        logo: 'https://example.com/logo-benito-juarez.png',
        settings: {
          allowPublicContent: true,
          requireApproval: true
        },
        createdAt: '2024-11-10T10:00:00.000Z',
        updatedAt: '2024-11-16T08:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ 
    summary: 'Buscar organización por código',
    description: 'Busca una organización usando su código único de invitación. Útil para que los usuarios se unan a una organización.'
  })
  @ApiParam({ 
    name: 'code', 
    description: 'Código único de la organización',
    example: 'EPB001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organización encontrada',
    schema: {
      example: {
        _id: '673org123def456789012345',
        name: 'Escuela Primaria Benito Juárez',
        code: 'EPB001',
        admin_id: {
          _id: '673abc123def456789012345',
          user_name: 'admin',
          role: 'admin'
        },
        description: 'Escuela primaria pública ubicada en el centro de la ciudad',
        settings: {
          allowPublicContent: true,
          requireApproval: true
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada con ese código' })
  findByCode(@Param('code') code: string) {
    return this.organizationService.findByCode(code);
  }

  @Get('admin/:adminId')
  @ApiOperation({ 
    summary: 'Obtener organizaciones de un administrador',
    description: 'Lista todas las organizaciones que administra un usuario específico.'
  })
  @ApiParam({ 
    name: 'adminId', 
    description: 'ID del administrador',
    example: '673admin123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de organizaciones del administrador',
    schema: {
      example: [
        {
          _id: '673org123def456789012345',
          name: 'Escuela Primaria Benito Juárez',
          code: 'EPB001',
          admin_id: '673abc123def456789012345',
          settings: {
            allowPublicContent: true,
            requireApproval: true
          },
          createdAt: '2024-11-10T10:00:00.000Z'
        },
        {
          _id: '673org456def789012345678',
          name: 'Colegio Secundaria Miguel Hidalgo',
          code: 'CSMH002',
          admin_id: '673abc123def456789012345',
          settings: {
            allowPublicContent: false,
            requireApproval: true
          },
          createdAt: '2024-11-05T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'No se encontraron organizaciones para este admin' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByAdmin(@Param('adminId') adminId: string) {
    return this.organizationService.findByAdmin(adminId);
  }

  @Get(':id/members/count')
  @ApiOperation({ 
    summary: 'Obtener conteo de miembros',
    description: 'Obtiene el número total de usuarios (docentes y estudiantes) que pertenecen a la organización.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la organización',
    example: '673org123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conteo de miembros obtenido',
    schema: {
      example: {
        organizationId: '673org123def456789012345',
        memberCount: 45
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMemberCount(@Param('id') id: string) {
    const count = await this.organizationService.getMemberCount(id);
    return {
      organizationId: id,
      memberCount: count.total
    };
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar organización',
    description: 'Actualiza la información de una organización existente. Solo admins pueden actualizar organizaciones.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la organización a actualizar',
    example: '673org123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar de la organización',
    type: UpdateOrganizationDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar descripción y logo',
        value: {
          description: 'Escuela primaria pública con enfoque en tecnología educativa',
          logo: 'https://example.com/new-logo.png'
        }
      },
      ejemplo2: {
        summary: 'Actualizar settings',
        value: {
          settings: {
            allowPublicContent: true,
            requireApproval: false
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organización actualizada exitosamente',
    schema: {
      example: {
        _id: '673org123def456789012345',
        name: 'Escuela Primaria Benito Juárez',
        code: 'EPB001',
        admin_id: {
          _id: '673abc123def456789012345',
          user_name: 'admin',
          role: 'admin'
        },
        description: 'Escuela primaria pública con enfoque en tecnología educativa',
        logo: 'https://example.com/new-logo.png',
        settings: {
          allowPublicContent: true,
          requireApproval: false
        },
        createdAt: '2024-11-10T10:00:00.000Z',
        updatedAt: '2024-11-16T16:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar organización',
    description: 'Elimina permanentemente una organización del sistema. ADVERTENCIA: Esto también afectará a todos los usuarios asociados.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la organización a eliminar',
    example: '673org123def456789012345'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Organización eliminada exitosamente (sin contenido en la respuesta)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organización eliminada exitosamente (con confirmación)',
    schema: {
      example: {
        message: 'Organización eliminada exitosamente',
        deletedOrganization: {
          _id: '673org123def456789012345',
          name: 'Escuela Secundaria Federal No. 5',
          code: 'ESF005'
        },
        affectedUsers: 45
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
