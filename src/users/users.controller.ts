import {Controller,Get,Post,Body,Patch,Param,Delete,UsePipes,ValidationPipe,Query,NotFoundException,UnauthorizedException,UseGuards,HttpCode,HttpStatus} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersDocument } from './users.schema';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
    @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        user_name: 'profesor1',
        role: 'docente'
      }
    }
  })
    @ApiResponse({ status: 401, description: 'Invalid password' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async login(@Body() body: { user_name: string; password: string }) {
      const user: UsersDocument | null = await this.usersService.findByUsername(body.user_name);
      if (!user) throw new NotFoundException('User not found');
  
      const isMatch = await bcrypt.compare(body.password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid password');
  
      return {
        _id: user._id,
        user_name: user.user_name,
        role: user.role
      };
    }
  

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        user_name: 'profesor1',
        role: 'docente',
        createdAt: '2023-05-18T14:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid role or data' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('admin', 'revisor')
  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los usuarios',
    description: 'Obtiene la lista completa de usuarios del sistema. Opcionalmente se puede filtrar por rol usando query params.'
  })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    description: 'Filtrar por rol (admin, revisor, docente, estudiante)',
    example: 'docente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          user_name: 'profesor1',
          email: 'profesor1@escuela.com',
          role: 'docente',
          status: 'active',
          profile: {
            fullName: 'Juan Pérez',
            bio: 'Profesor de Matemáticas',
            avatar: null
          },
          organization_id: '673xyz789abc123456789012',
          createdAt: '2024-11-15T10:30:00.000Z'
        },
        {
          _id: '673abc456def789012345678',
          user_name: 'estudiante1',
          email: 'estudiante1@escuela.com',
          role: 'estudiante',
          status: 'active',
          profile: {
            fullName: 'María García'
          },
          createdAt: '2024-11-16T08:15:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Requiere rol admin o revisor' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Roles('admin')
  @Get('pending')
  @ApiOperation({ 
    summary: 'Listar usuarios pendientes de aprobación',
    description: 'Obtiene todos los usuarios con status "pending" que están esperando ser aprobados por un administrador.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios pendientes',
    schema: {
      example: [
        {
          _id: '673abc789def012345678901',
          user_name: 'nuevo_docente',
          email: 'docente@escuela.com',
          role: 'docente',
          status: 'pending',
          profile: {
            fullName: 'Carlos López',
            bio: 'Profesor de Física'
          },
          createdAt: '2024-11-16T12:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  findPending() {
    return this.usersService.findPendingUsers();
  }

  @Roles('admin', 'revisor')
  @Get('role/:role')
  @ApiOperation({ 
    summary: 'Obtener usuarios por rol',
    description: 'Filtra y obtiene todos los usuarios que tienen un rol específico.'
  })
  @ApiParam({ 
    name: 'role', 
    description: 'Rol a filtrar',
    enum: ['admin', 'revisor', 'docente', 'estudiante'],
    example: 'docente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios con el rol especificado',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          user_name: 'profesor1',
          email: 'profesor1@escuela.com',
          role: 'docente',
          status: 'active',
          profile: {
            fullName: 'Juan Pérez'
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  findByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Roles('admin')
  @Get('organization/:organizationId')
  @ApiOperation({ 
    summary: 'Obtener usuarios de una organización',
    description: 'Lista todos los usuarios que pertenecen a una organización específica.'
  })
  @ApiParam({ 
    name: 'organizationId', 
    description: 'ID de la organización',
    example: '673xyz789abc123456789012'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios de la organización',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          user_name: 'profesor_org1',
          email: 'profesor@escuela1.com',
          role: 'docente',
          organization_id: '673xyz789abc123456789012',
          status: 'active'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.usersService.findByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Obtiene la información completa de un usuario específico por su ID.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'profesor1',
        email: 'profesor1@escuela.com',
        role: 'docente',
        status: 'active',
        profile: {
          fullName: 'Juan Pérez',
          bio: 'Profesor de Matemáticas',
          avatar: null,
          phone: '+52 123 456 7890',
          address: 'Calle Principal 123'
        },
        permissions: {
          canReview: false,
          canManageUsers: false
        },
        organization_id: '673xyz789abc123456789012',
        createdAt: '2024-11-15T10:30:00.000Z',
        updatedAt: '2024-11-16T08:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar información de usuario',
    description: 'Actualiza los datos de un usuario existente. Solo admins pueden actualizar usuarios.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a actualizar',
    example: '673abc123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar del usuario',
    schema: {
      example: {
        profile: {
          fullName: 'Juan Pérez Actualizado',
          bio: 'Profesor de Matemáticas Avanzadas',
          phone: '+52 123 456 7890'
        },
        email: 'nuevo_email@escuela.com'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'profesor1',
        email: 'nuevo_email@escuela.com',
        role: 'docente',
        status: 'active',
        profile: {
          fullName: 'Juan Pérez Actualizado',
          bio: 'Profesor de Matemáticas Avanzadas',
          phone: '+52 123 456 7890'
        },
        updatedAt: '2024-11-16T14:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('admin')
  @Post('approve/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Aprobar usuario pendiente',
    description: 'Cambia el estado de un usuario de "pending" a "active", permitiéndole acceder al sistema.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a aprobar',
    example: '673abc789def012345678901'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario aprobado exitosamente',
    schema: {
      example: {
        _id: '673abc789def012345678901',
        user_name: 'nuevo_docente',
        email: 'docente@escuela.com',
        role: 'docente',
        status: 'active',
        approvedBy: '673abc123def456789012345',
        approvedAt: '2024-11-16T14:45:00.000Z',
        message: 'Usuario aprobado exitosamente'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'El usuario no está pendiente de aprobación' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  approveUser(@Param('id') id: string, @GetUser('_id') adminId: string) {
    return this.usersService.approveUser(id, adminId);
  }

  @Roles('admin')
  @Post('reject/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Rechazar usuario pendiente',
    description: 'Cambia el estado de un usuario de "pending" a "rejected", denegando su acceso al sistema.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a rechazar',
    example: '673abc789def012345678901'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario rechazado exitosamente',
    schema: {
      example: {
        _id: '673abc789def012345678901',
        user_name: 'usuario_rechazado',
        email: 'rechazado@escuela.com',
        role: 'docente',
        status: 'rejected',
        rejectedBy: '673abc123def456789012345',
        rejectedAt: '2024-11-16T14:50:00.000Z',
        message: 'Usuario rechazado'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'El usuario no está pendiente de aprobación' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  rejectUser(@Param('id') id: string, @GetUser('_id') adminId: string) {
    return this.usersService.rejectUser(id, adminId);
  }

  @Roles('admin')
  @Post('suspend/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Suspender usuario',
    description: 'Suspende temporalmente a un usuario activo, impidiéndole acceder al sistema hasta que sea reactivado.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a suspender',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario suspendido exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'usuario_suspendido',
        email: 'suspendido@escuela.com',
        role: 'docente',
        status: 'suspended',
        suspendedAt: '2024-11-16T15:00:00.000Z',
        message: 'Usuario suspendido exitosamente'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  suspendUser(@Param('id') id: string) {
    return this.usersService.suspendUser(id);
  }

  @Roles('admin')
  @Post('activate/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Activar usuario suspendido',
    description: 'Reactiva un usuario suspendido, permitiéndole volver a acceder al sistema.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a activar',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario activado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'usuario_reactivado',
        email: 'reactivado@escuela.com',
        role: 'docente',
        status: 'active',
        activatedAt: '2024-11-16T15:10:00.000Z',
        message: 'Usuario activado exitosamente'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina permanentemente un usuario del sistema. Esta acción no se puede deshacer.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del usuario a eliminar',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        message: 'Usuario eliminado exitosamente',
        deletedUser: {
          _id: '673abc123def456789012345',
          user_name: 'usuario_eliminado',
          email: 'eliminado@escuela.com'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('username/:username')
  @ApiOperation({ 
    summary: 'Obtener usuario por username',
    description: 'Busca y obtiene un usuario específico por su nombre de usuario.'
  })
  @ApiParam({ 
    name: 'username', 
    description: 'Nombre de usuario',
    example: 'profesor1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'profesor1',
        email: 'profesor1@escuela.com',
        role: 'docente',
        status: 'active',
        profile: {
          fullName: 'Juan Pérez'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
