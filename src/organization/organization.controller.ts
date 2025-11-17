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
        summary: 'Escuela Secundaria',
        value: {
          name: 'Escuela Secundaria Federal No. 5',
          code: 'ESF005',
          description: 'Escuela secundaria pública en la Ciudad de México',
          type: 'secondary_school',
          contact: {
            email: 'contacto@esf005.edu.mx',
            phone: '+52 55 1234 5678',
            address: 'Av. Insurgentes Sur 1234, CDMX'
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
        name: 'Escuela Secundaria Federal No. 5',
        code: 'ESF005',
        description: 'Escuela secundaria pública en la Ciudad de México',
        type: 'secondary_school',
        contact: {
          email: 'contacto@esf005.edu.mx',
          phone: '+52 55 1234 5678',
          address: 'Av. Insurgentes Sur 1234, CDMX'
        },
        memberCount: 0,
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
          name: 'Escuela Secundaria Federal No. 5',
          code: 'ESF005',
          type: 'secondary_school',
          memberCount: 45,
          createdAt: '2024-11-10T10:00:00.000Z'
        },
        {
          _id: '673org456def789012345678',
          name: 'Instituto Tecnológico Superior',
          code: 'ITS2024',
          type: 'university',
          memberCount: 120,
          createdAt: '2024-11-05T08:00:00.000Z'
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
        name: 'Escuela Secundaria Federal No. 5',
        code: 'ESF005',
        description: 'Escuela secundaria pública en la Ciudad de México',
        type: 'secondary_school',
        contact: {
          email: 'contacto@esf005.edu.mx',
          phone: '+52 55 1234 5678',
          address: 'Av. Insurgentes Sur 1234, CDMX',
          website: 'https://esf005.edu.mx'
        },
        memberCount: 45,
        admins: ['673admin123def456789012345'],
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
    example: 'ESF005'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organización encontrada',
    schema: {
      example: {
        _id: '673org123def456789012345',
        name: 'Escuela Secundaria Federal No. 5',
        code: 'ESF005',
        description: 'Escuela secundaria pública en la Ciudad de México',
        type: 'secondary_school',
        memberCount: 45,
        contact: {
          email: 'contacto@esf005.edu.mx'
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
          name: 'Escuela Secundaria Federal No. 5',
          code: 'ESF005',
          memberCount: 45
        },
        {
          _id: '673org456def789012345678',
          name: 'Instituto Tecnológico',
          code: 'ITS2024',
          memberCount: 120
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
        organizationName: 'Escuela Secundaria Federal No. 5',
        totalMembers: 45,
        byRole: {
          docente: 12,
          estudiante: 33
        },
        byStatus: {
          active: 42,
          pending: 3
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getMemberCount(@Param('id') id: string) {
    return this.organizationService.getMemberCount(id);
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
        summary: 'Actualizar información de contacto',
        value: {
          description: 'Descripción actualizada de la escuela',
          contact: {
            email: 'nuevo_contacto@esf005.edu.mx',
            phone: '+52 55 9876 5432',
            website: 'https://esf005.edu.mx'
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
        name: 'Escuela Secundaria Federal No. 5',
        code: 'ESF005',
        description: 'Descripción actualizada de la escuela',
        contact: {
          email: 'nuevo_contacto@esf005.edu.mx',
          phone: '+52 55 9876 5432',
          website: 'https://esf005.edu.mx'
        },
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
