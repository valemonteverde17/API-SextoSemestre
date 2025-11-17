import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MemoramaService } from './memorama.service';
import { CreateMemoramaDto } from './dto/create-memorama.dto';
import { UpdateMemoramaDto } from './dto/update-memorama.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Juegos')
@ApiBearerAuth('bearer')
@Controller('memorama')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class MemoramaController {
  constructor(private readonly memoramaService: MemoramaService) {}

  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ 
    summary: 'Crear par de Memorama',
    description: 'Crea un nuevo par de tarjetas para el juego de memorama asociado a un topic. Solo docentes y admins pueden crear pares.'
  })
  @ApiBody({
    description: 'Datos del par de memorama',
    type: CreateMemoramaDto,
    examples: {
      ejemplo1: {
        summary: 'Par de Vocabulario',
        value: {
          topic_id: '673abc123def456789012345',
          card1: 'Hello',
          card2: 'Hola',
          difficulty: 'easy'
        }
      },
      ejemplo2: {
        summary: 'Par de Programación',
        value: {
          topic_id: '673abc456def789012345678',
          card1: 'Variable',
          card2: 'Contenedor de datos',
          difficulty: 'medium'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Par creado exitosamente',
    schema: {
      example: {
        _id: '673memo123def456789012345',
        topic_id: '673abc123def456789012345',
        card1: 'Hello',
        card2: 'Hola',
        difficulty: 'easy',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes y admins' })
  create(@Body() createMemoramaDto: CreateMemoramaDto) {
    return this.memoramaService.create(createMemoramaDto);
  }

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los pares',
    description: 'Obtiene la lista completa de pares de memorama. Público para todos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pares',
    schema: {
      example: [
        {
          _id: '673memo123def456789012345',
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'ingles-basico'
          },
          card1: 'Hello',
          card2: 'Hola',
          difficulty: 'easy',
          createdAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673memo456def789012345678',
          topic_id: {
            _id: '673abc456def789012345678',
            topic_name: 'javascript-fundamentos'
          },
          card1: 'Variable',
          card2: 'Contenedor de datos',
          difficulty: 'medium',
          createdAt: '2024-11-16T08:00:00.000Z'
        }
      ]
    }
  })
  findAll() {
    return this.memoramaService.findAll();
  }

  @Public()
  @Get('topic/:topicId')
  @ApiOperation({ 
    summary: 'Obtener pares por topic',
    description: 'Obtiene todos los pares de memorama de un topic específico. Puede filtrar por dificultad. Público para todos.'
  })
  @ApiParam({ 
    name: 'topicId', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiQuery({ 
    name: 'difficulty', 
    required: false, 
    description: 'Filtrar por dificultad (easy, medium, hard)',
    example: 'easy'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pares del topic',
    schema: {
      example: [
        {
          _id: '673memo123def456789012345',
          topic_id: '673abc123def456789012345',
          card1: 'Hello',
          card2: 'Hola',
          difficulty: 'easy'
        },
        {
          _id: '673memo456def789012345678',
          topic_id: '673abc123def456789012345',
          card1: 'Goodbye',
          card2: 'Adiós',
          difficulty: 'easy'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  findByTopic(
    @Param('topicId') topicId: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.memoramaService.findByTopic(topicId, difficulty);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener par por ID',
    description: 'Obtiene la información completa de un par de memorama específico. Público para todos.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del par',
    example: '673memo123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Par encontrado',
    schema: {
      example: {
        _id: '673memo123def456789012345',
        topic_id: {
          _id: '673abc123def456789012345',
          topic_name: 'ingles-basico',
          description: 'Vocabulario básico de inglés'
        },
        card1: 'Hello',
        card2: 'Hola',
        difficulty: 'easy',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Par no encontrado' })
  findOne(@Param('id') id: string) {
    return this.memoramaService.findOne(id);
  }

  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar par',
    description: 'Actualiza un par de memorama existente. Solo docentes y admins pueden actualizarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del par a actualizar',
    example: '673memo123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar',
    type: UpdateMemoramaDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar tarjetas',
        value: {
          card1: 'Good morning',
          card2: 'Buenos días'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Par actualizado',
    schema: {
      example: {
        _id: '673memo123def456789012345',
        card1: 'Good morning',
        card2: 'Buenos días',
        difficulty: 'easy',
        updatedAt: '2024-11-17T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Par no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateMemoramaDto: UpdateMemoramaDto) {
    return this.memoramaService.update(id, updateMemoramaDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar par',
    description: 'Elimina permanentemente un par de memorama. Solo admins pueden eliminar pares.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del par a eliminar',
    example: '673memo123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Par eliminado',
    schema: {
      example: {
        message: 'Par de memorama eliminado exitosamente',
        _id: '673memo123def456789012345'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Par no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.memoramaService.remove(id);
  }
}
