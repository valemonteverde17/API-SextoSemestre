import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApprovalService } from '../common/services/approval.service';

@ApiTags('Topics') 
@ApiBearerAuth('bearer') 
@Controller('topics')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true })) 
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly approvalService: ApprovalService
  ) {}

  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo topic educativo',
    description: 'Crea un nuevo contenido educativo (topic) con bloques de contenido personalizables. Solo docentes y admins pueden crear topics.'
  })
  @ApiBody({
    description: 'Datos del topic a crear',
    type: CreateTopicDto,
    examples: {
      ejemplo1: {
        summary: 'Topic de Matemáticas',
        value: {
          topic_name: 'Introducción al Álgebra',
          description: 'Conceptos básicos de álgebra para principiantes',
          category: 'Matemáticas',
          difficulty: 'beginner',
          visibility: 'public',
          content: [
            {
              type: 'heading',
              content: '¿Qué es el Álgebra?',
              order: 0,
              style: { fontSize: 'large', fontWeight: 'bold' }
            },
            {
              type: 'paragraph',
              content: 'El álgebra es una rama de las matemáticas que utiliza letras y símbolos para representar números y cantidades.',
              order: 1
            },
            {
              type: 'code',
              content: 'x + 5 = 10\nx = 10 - 5\nx = 5',
              order: 2,
              style: { codeLanguage: 'text', codeTheme: 'dark' }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Topic creado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Introducción al Álgebra',
        description: 'Conceptos básicos de álgebra para principiantes',
        category: 'Matemáticas',
        difficulty: 'beginner',
        visibility: 'public',
        status: 'draft',
        created_by: '673user123def456789012345',
        content: [
          {
            type: 'heading',
            content: '¿Qué es el Álgebra?',
            order: 0
          }
        ],
        createdAt: '2024-11-16T10:00:00.000Z',
        updatedAt: '2024-11-16T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes y admins' })
  create(@Body() createTopicDto: CreateTopicDto, @GetUser('_id') userId: string) {
    createTopicDto.created_by = userId;
    return this.topicsService.create(createTopicDto);
  }

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Listar topics',
    description: 'Obtiene la lista de topics. Si el usuario está autenticado, ve topics según sus permisos. Si es público, solo ve topics aprobados y públicos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de topics obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          topic_name: 'Introducción al Álgebra',
          description: 'Conceptos básicos de álgebra',
          category: 'Matemáticas',
          difficulty: 'beginner',
          visibility: 'public',
          status: 'approved',
          created_by: {
            _id: '673user123def456789012345',
            user_name: 'profesor1',
            profile: { fullName: 'Juan Pérez' }
          },
          approvedAt: '2024-11-15T14:00:00.000Z',
          createdAt: '2024-11-14T10:00:00.000Z'
        },
        {
          _id: '673abc456def789012345678',
          topic_name: 'Historia de México',
          description: 'Eventos importantes de la historia mexicana',
          category: 'Historia',
          difficulty: 'intermediate',
          visibility: 'public',
          status: 'approved',
          createdAt: '2024-11-13T08:00:00.000Z'
        }
      ]
    }
  })
  findAll(@Query() query: any, @GetUser() user?: any) {
    if (user) {
      return this.topicsService.findByUserPermissions(
        user._id,
        user.role,
        user.organization_id
      );
    }
    // Si no hay usuario (público), solo temas aprobados y públicos
    return this.topicsService.findAll({ status: 'approved', visibility: 'public' });
  }

  @Roles('docente')
  @Get('my-topics')
  @ApiOperation({ 
    summary: 'Obtener mis topics',
    description: 'Obtiene todos los topics creados por el usuario autenticado, independientemente de su estado.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de topics del usuario',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          topic_name: 'Mi Topic de Matemáticas',
          description: 'Topic en borrador',
          category: 'Matemáticas',
          status: 'draft',
          visibility: 'public',
          created_by: '673user123def456789012345',
          createdAt: '2024-11-16T10:00:00.000Z'
        },
        {
          _id: '673abc456def789012345678',
          topic_name: 'Topic Aprobado',
          description: 'Topic ya aprobado',
          category: 'Ciencias',
          status: 'approved',
          visibility: 'public',
          approvedBy: '673admin123def456789012345',
          approvedAt: '2024-11-15T14:00:00.000Z',
          createdAt: '2024-11-14T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes' })
  getMyTopics(@GetUser('_id') userId: string) {
    return this.topicsService.findMyTopics(userId);
  }

  @Roles('admin', 'revisor')
  @Get('pending-review')
  @ApiOperation({ 
    summary: 'Obtener topics pendientes de revisión',
    description: 'Lista todos los topics que están esperando ser revisados y aprobados. Los revisores solo ven topics de su organización.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de topics pendientes',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          topic_name: 'Nuevo Topic de Física',
          description: 'Leyes de Newton',
          category: 'Física',
          status: 'pending_review',
          created_by: {
            _id: '673user123def456789012345',
            user_name: 'profesor1',
            profile: { fullName: 'Juan Pérez' }
          },
          submittedAt: '2024-11-16T10:00:00.000Z',
          createdAt: '2024-11-15T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins y revisores' })
  getPendingReview(@GetUser('organization_id') orgId?: string) {
    return this.approvalService.getPendingTopics(orgId);
  }

  @Roles('admin', 'revisor')
  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de aprobación',
    description: 'Obtiene estadísticas sobre topics aprobados, rechazados y pendientes. Útil para dashboards de administración.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de aprobación',
    schema: {
      example: {
        total: 150,
        approved: 120,
        pending: 15,
        rejected: 10,
        draft: 5,
        byCategory: {
          'Matemáticas': 45,
          'Ciencias': 38,
          'Historia': 32,
          'Literatura': 35
        },
        byDifficulty: {
          beginner: 60,
          intermediate: 55,
          advanced: 35
        },
        recentApprovals: [
          {
            _id: '673abc123def456789012345',
            topic_name: 'Álgebra Básica',
            approvedAt: '2024-11-16T14:00:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins y revisores' })
  getStats(@GetUser('organization_id') orgId?: string) {
    return this.approvalService.getApprovalStats(orgId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener topic por ID',
    description: 'Obtiene la información completa de un topic específico, incluyendo todo su contenido y bloques.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic encontrado',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Introducción al Álgebra',
        description: 'Conceptos básicos de álgebra para principiantes',
        category: 'Matemáticas',
        difficulty: 'beginner',
        visibility: 'public',
        status: 'approved',
        created_by: {
          _id: '673user123def456789012345',
          user_name: 'profesor1',
          profile: { fullName: 'Juan Pérez' }
        },
        content: [
          {
            type: 'heading',
            content: '¿Qué es el Álgebra?',
            order: 0,
            style: { fontSize: 'large', fontWeight: 'bold' }
          },
          {
            type: 'paragraph',
            content: 'El álgebra es una rama de las matemáticas...',
            order: 1
          },
          {
            type: 'code',
            content: 'x + 5 = 10',
            order: 2,
            style: { codeLanguage: 'text', codeTheme: 'dark' }
          }
        ],
        approvedBy: '673admin123def456789012345',
        approvedAt: '2024-11-15T14:00:00.000Z',
        createdAt: '2024-11-14T10:00:00.000Z',
        updatedAt: '2024-11-15T14:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar topic',
    description: 'Actualiza la información de un topic. Solo el creador del topic puede actualizarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a actualizar',
    example: '673abc123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar del topic',
    type: UpdateTopicDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar descripción y contenido',
        value: {
          description: 'Descripción actualizada del topic',
          content: [
            {
              type: 'heading',
              content: 'Nuevo título',
              order: 0
            },
            {
              type: 'paragraph',
              content: 'Contenido actualizado',
              order: 1
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic actualizado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Introducción al Álgebra',
        description: 'Descripción actualizada del topic',
        category: 'Matemáticas',
        status: 'draft',
        updatedAt: '2024-11-16T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo el creador puede actualizar' })
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Roles('docente')
  @Post(':id/submit-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enviar topic a revisión',
    description: 'Envía un topic en estado draft a revisión para que sea aprobado por un admin o revisor.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a enviar',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic enviado a revisión exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Introducción al Álgebra',
        status: 'pending_review',
        submittedAt: '2024-11-16T15:30:00.000Z',
        message: 'Topic enviado a revisión exitosamente'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'El topic no puede ser enviado (debe estar en draft)' })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes' })
  submitForReview(@Param('id') id: string, @GetUser('_id') userId: string) {
    return this.approvalService.submitTopicForReview(id, userId);
  }

  @Roles('admin', 'revisor')
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Aprobar topic',
    description: 'Aprueba un topic que está en revisión, cambiando su estado a approved y haciéndolo visible para los estudiantes.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a aprobar',
    example: '673abc123def456789012345'
  })
  @ApiBody({
    description: 'Comentarios opcionales de aprobación',
    required: false,
    schema: {
      example: {
        comments: 'Excelente contenido, aprobado para publicación'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic aprobado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Introducción al Álgebra',
        status: 'approved',
        approvedBy: '673admin123def456789012345',
        approvedAt: '2024-11-16T16:00:00.000Z',
        reviewComments: 'Excelente contenido, aprobado para publicación',
        message: 'Topic aprobado exitosamente'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'El topic no está en revisión' })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins y revisores' })
  approveTopic(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body?: { comments?: string }
  ) {
    return this.approvalService.approveTopic(id, reviewerId, body?.comments);
  }

  @Roles('admin', 'revisor')
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Rechazar topic',
    description: 'Rechaza un topic en revisión. Los comentarios son obligatorios para explicar el motivo del rechazo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a rechazar',
    example: '673abc123def456789012345'
  })
  @ApiBody({
    description: 'Comentarios obligatorios explicando el rechazo',
    required: true,
    schema: {
      example: {
        comments: 'El contenido no cumple con los estándares de calidad. Por favor revisa la ortografía y agrega más ejemplos.'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic rechazado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Topic Rechazado',
        status: 'rejected',
        rejectedBy: '673admin123def456789012345',
        rejectedAt: '2024-11-16T16:15:00.000Z',
        reviewComments: 'El contenido no cumple con los estándares de calidad...',
        message: 'Topic rechazado'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Comentarios son requeridos' })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins y revisores' })
  rejectTopic(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body: { comments: string }
  ) {
    return this.approvalService.rejectTopic(id, reviewerId, body.comments);
  }

  @Roles('admin', 'revisor')
  @Post(':id/request-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar cambios en topic',
    description: 'Solicita cambios en un topic en revisión. El topic vuelve a draft para que el autor pueda editarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiBody({
    description: 'Comentarios especificando los cambios requeridos',
    required: true,
    schema: {
      example: {
        comments: 'Por favor agrega más ejemplos prácticos en la sección 2 y corrige la fórmula del ejercicio 5.'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cambios solicitados exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Topic con Cambios Solicitados',
        status: 'changes_requested',
        reviewedBy: '673admin123def456789012345',
        reviewComments: 'Por favor agrega más ejemplos prácticos...',
        requestedChangesAt: '2024-11-16T16:30:00.000Z',
        message: 'Cambios solicitados. El topic ha vuelto a draft para edición.'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Comentarios son requeridos' })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins y revisores' })
  requestChanges(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body: { comments: string }
  ) {
    return this.approvalService.requestTopicChanges(id, reviewerId, body.comments);
  }

  @Roles('admin')
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Archivar topic',
    description: 'Archiva un topic, ocultándolo de las listas públicas pero manteniéndolo en el sistema para referencia.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a archivar',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic archivado exitosamente',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        topic_name: 'Topic Archivado',
        status: 'archived',
        archivedAt: '2024-11-16T17:00:00.000Z',
        message: 'Topic archivado exitosamente'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  archiveTopic(@Param('id') id: string) {
    return this.approvalService.archiveTopic(id);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar topic',
    description: 'Elimina permanentemente un topic del sistema. Esta acción no se puede deshacer. Se recomienda archivar en lugar de eliminar.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del topic a eliminar',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic eliminado exitosamente',
    schema: {
      example: {
        message: 'Topic eliminado exitosamente',
        deletedTopic: {
          _id: '673abc123def456789012345',
          topic_name: 'Topic Eliminado',
          category: 'Matemáticas'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }

  @Get('name/:topic_name')
  @ApiOperation({ 
    summary: 'Buscar topic por nombre',
    description: 'Busca un topic específico por su nombre exacto o parcial.'
  })
  @ApiParam({ 
    name: 'topic_name', 
    description: 'Nombre del topic a buscar',
    example: 'Introducción al Álgebra'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic(s) encontrado(s)',
    schema: {
      example: [
        {
          _id: '673abc123def456789012345',
          topic_name: 'Introducción al Álgebra',
          description: 'Conceptos básicos de álgebra',
          category: 'Matemáticas',
          difficulty: 'beginner',
          status: 'approved',
          created_by: {
            user_name: 'profesor1',
            profile: { fullName: 'Juan Pérez' }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'No se encontraron topics con ese nombre' })
  findByName(@Param('topic_name') topic_name: string) {
    return this.topicsService.findByName(topic_name);
  }
}