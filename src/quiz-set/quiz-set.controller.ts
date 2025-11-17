import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QuizSetService } from './quiz-set.service';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Quiz-Sets')
@ApiBearerAuth('bearer')
@Controller('quiz-sets')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class QuizSetController {
  constructor(private readonly quizSetService: QuizSetService) {}

  @Roles('docente', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear conjunto de quizzes',
    description: 'Crea un nuevo conjunto (quiz-set) que agrupa múltiples quizzes relacionados con un topic. Solo docentes y admins pueden crear conjuntos.'
  })
  @ApiBody({
    description: 'Datos del conjunto de quizzes',
    type: CreateQuizSetDto,
    examples: {
      ejemplo1: {
        summary: 'Conjunto Básico',
        value: {
          quiz_name: 'Evaluación de JavaScript Básico',
          description: 'Conjunto de preguntas sobre conceptos básicos de JavaScript',
          topic_id: '673abc123def456789012345',
          isActive: true
        }
      },
      ejemplo2: {
        summary: 'Examen Final',
        value: {
          quiz_name: 'Examen Final - Matemáticas',
          description: 'Evaluación final del curso de matemáticas avanzadas',
          topic_id: '673abc456def789012345678',
          isActive: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Conjunto creado exitosamente',
    schema: {
      example: {
        _id: '673set123def456789012345',
        quiz_name: 'Evaluación de JavaScript Básico',
        description: 'Conjunto de preguntas sobre conceptos básicos de JavaScript',
        topic_id: '673abc123def456789012345',
        isActive: true,
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes y admins' })
  create(@Body() createQuizSetDto: CreateQuizSetDto) {
    return this.quizSetService.create(createQuizSetDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los conjuntos',
    description: 'Obtiene la lista completa de conjuntos de quizzes disponibles. Muestra solo los conjuntos activos por defecto.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de conjuntos obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '673set123def456789012345',
          quiz_name: 'Evaluación de JavaScript Básico',
          description: 'Conjunto de preguntas sobre conceptos básicos de JavaScript',
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'javascript-fundamentos'
          },
          isActive: true,
          createdAt: '2024-11-17T10:00:00.000Z',
          updatedAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673set456def789012345678',
          quiz_name: 'Examen Final - Matemáticas',
          description: 'Evaluación final del curso',
          topic_id: {
            _id: '673abc456def789012345678',
            topic_name: 'matematicas-avanzadas'
          },
          isActive: true,
          createdAt: '2024-11-16T08:00:00.000Z',
          updatedAt: '2024-11-16T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll() {
    return this.quizSetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener conjunto por ID',
    description: 'Obtiene la información completa de un conjunto específico incluyendo todos sus quizzes asociados.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del conjunto',
    example: '673set123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conjunto encontrado',
    schema: {
      example: {
        _id: '673set123def456789012345',
        quiz_name: 'Evaluación de JavaScript Básico',
        description: 'Conjunto de preguntas sobre conceptos básicos de JavaScript',
        topic_id: {
          _id: '673abc123def456789012345',
          topic_name: 'javascript-fundamentos',
          description: 'Fundamentos de JavaScript para principiantes'
        },
        isActive: true,
        quizzes: [
          {
            _id: '673quiz123def456789012345',
            question: '¿Qué es JavaScript?',
            options: ['Un lenguaje', 'Un framework', 'Una base de datos', 'Un SO'],
            order: 1
          },
          {
            _id: '673quiz456def789012345678',
            question: '¿Cómo se declara una variable?',
            options: ['var x', 'variable x', 'v x', 'int x'],
            order: 2
          }
        ],
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Conjunto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.quizSetService.findOne(id);
  }

  @Get('topic/:topicId')
  @ApiOperation({ 
    summary: 'Obtener conjuntos por topic',
    description: 'Obtiene todos los conjuntos de quizzes asociados a un topic específico. Útil para mostrar todas las evaluaciones disponibles de un tema.'
  })
  @ApiParam({ 
    name: 'topicId', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de conjuntos del topic',
    schema: {
      example: [
        {
          _id: '673set123def456789012345',
          quiz_name: 'Evaluación Parcial 1',
          description: 'Primera evaluación del tema',
          topic_id: '673abc123def456789012345',
          isActive: true,
          createdAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673set456def789012345678',
          quiz_name: 'Evaluación Parcial 2',
          description: 'Segunda evaluación del tema',
          topic_id: '673abc123def456789012345',
          isActive: true,
          createdAt: '2024-11-18T10:00:00.000Z'
        },
        {
          _id: '673set789def012345678901',
          quiz_name: 'Examen Final',
          description: 'Evaluación final del tema',
          topic_id: '673abc123def456789012345',
          isActive: true,
          createdAt: '2024-11-20T10:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.quizSetService.findByTopic(topicId);
  }

  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar conjunto',
    description: 'Actualiza la información de un conjunto de quizzes. Solo docentes y admins pueden actualizarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del conjunto a actualizar',
    example: '673set123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar del conjunto',
    type: UpdateQuizSetDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar nombre y descripción',
        value: {
          quiz_name: 'Evaluación Actualizada',
          description: 'Descripción actualizada del conjunto'
        }
      },
      ejemplo2: {
        summary: 'Desactivar conjunto',
        value: {
          isActive: false
        }
      },
      ejemplo3: {
        summary: 'Actualización completa',
        value: {
          quiz_name: 'Examen Final Revisado',
          description: 'Versión actualizada del examen final',
          isActive: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conjunto actualizado exitosamente',
    schema: {
      example: {
        _id: '673set123def456789012345',
        quiz_name: 'Evaluación Actualizada',
        description: 'Descripción actualizada del conjunto',
        topic_id: '673abc123def456789012345',
        isActive: true,
        updatedAt: '2024-11-17T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Conjunto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes y admins' })
  update(@Param('id') id: string, @Body() updateQuizSetDto: UpdateQuizSetDto) {
    return this.quizSetService.update(id, updateQuizSetDto);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar conjunto',
    description: 'Elimina permanentemente un conjunto de quizzes del sistema. Solo admins pueden eliminarlo. ADVERTENCIA: Esto también puede afectar los quizzes asociados.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del conjunto a eliminar',
    example: '673set123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conjunto eliminado exitosamente',
    schema: {
      example: {
        message: 'Conjunto de quizzes eliminado exitosamente',
        _id: '673set123def456789012345'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Conjunto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.quizSetService.remove(id);
  }
}
