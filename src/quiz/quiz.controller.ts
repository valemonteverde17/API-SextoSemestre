import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Quizzes')
@ApiBearerAuth('bearer')
@Controller('quizzes')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo quiz',
    description: 'Crea una nueva pregunta de quiz asociada a un topic. Solo docentes y admins pueden crear quizzes.'
  })
  @ApiBody({
    description: 'Datos del quiz a crear',
    type: CreateQuizDto,
    examples: {
      ejemplo1: {
        summary: 'Quiz de Opción Múltiple',
        value: {
          question: '¿Cuál es la capital de Francia?',
          options: ['Londres', 'París', 'Madrid', 'Roma'],
          correctAnswer: 'París',
          topic_id: '673abc123def456789012345',
          order: 1
        }
      },
      ejemplo2: {
        summary: 'Quiz de Programación',
        value: {
          question: '¿Qué método se usa para agregar un elemento al final de un array en JavaScript?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 'push()',
          topic_id: '673abc123def456789012345',
          quiz_set_id: '673set123def456789012345',
          order: 2
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Quiz creado exitosamente',
    schema: {
      example: {
        _id: '673quiz123def456789012345',
        question: '¿Cuál es la capital de Francia?',
        options: ['Londres', 'París', 'Madrid', 'Roma'],
        correctAnswer: 'París',
        topic_id: '673abc123def456789012345',
        quiz_set_id: null,
        order: 1,
        created_by: '673user123def456789012345',
        organization_id: null,
        status: 'draft',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo docentes y admins' })
  create(@Body() createQuizDto: CreateQuizDto, @GetUser('_id') userId: string) {
    return this.quizService.create({ ...createQuizDto, created_by: userId });
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los quizzes',
    description: 'Obtiene la lista completa de quizzes disponibles. Los usuarios ven solo quizzes aprobados, los docentes ven los suyos y los admins ven todos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de quizzes obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '673quiz123def456789012345',
          question: '¿Cuál es la capital de Francia?',
          options: ['Londres', 'París', 'Madrid', 'Roma'],
          correctAnswer: 'París',
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'geografia-europa'
          },
          quiz_set_id: null,
          order: 1,
          created_by: {
            _id: '673user123def456789012345',
            user_name: 'profesor1'
          },
          status: 'approved',
          createdAt: '2024-11-17T10:00:00.000Z',
          updatedAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673quiz456def789012345678',
          question: '¿Qué método se usa para agregar un elemento al final de un array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 'push()',
          topic_id: {
            _id: '673abc456def789012345678',
            topic_name: 'javascript-arrays'
          },
          order: 1,
          status: 'approved',
          createdAt: '2024-11-16T08:00:00.000Z',
          updatedAt: '2024-11-16T08:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll() {
    return this.quizService.findAll();
  }

  @Get('topic/:topicId')
  @ApiOperation({ 
    summary: 'Obtener quizzes por topic',
    description: 'Obtiene todos los quizzes asociados a un topic específico. Útil para mostrar las preguntas de evaluación de un tema.'
  })
  @ApiParam({ 
    name: 'topicId', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de quizzes del topic',
    schema: {
      example: [
        {
          _id: '673quiz123def456789012345',
          question: '¿Cuál es la sintaxis correcta para declarar una variable en JavaScript?',
          options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'int x = 5;'],
          correctAnswer: 'var x = 5;',
          topic_id: '673abc123def456789012345',
          order: 1,
          status: 'approved',
          createdAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673quiz456def789012345678',
          question: '¿Qué palabra clave se usa para declarar una constante?',
          options: ['const', 'let', 'var', 'constant'],
          correctAnswer: 'const',
          topic_id: '673abc123def456789012345',
          order: 2,
          status: 'approved',
          createdAt: '2024-11-17T10:05:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.quizService.findByTopic(topicId);
  }

  @Get('quiz-set/:quizSetId')
  @ApiOperation({ 
    summary: 'Obtener quizzes por conjunto',
    description: 'Obtiene todos los quizzes que pertenecen a un conjunto específico (quiz-set). Los conjuntos agrupan quizzes relacionados.'
  })
  @ApiParam({ 
    name: 'quizSetId', 
    description: 'ID del conjunto de quizzes',
    example: '673set123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de quizzes del conjunto',
    schema: {
      example: [
        {
          _id: '673quiz123def456789012345',
          question: 'Pregunta 1 del conjunto',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctAnswer: 'Opción A',
          topic_id: '673abc123def456789012345',
          quiz_set_id: '673set123def456789012345',
          order: 1,
          status: 'approved'
        },
        {
          _id: '673quiz456def789012345678',
          question: 'Pregunta 2 del conjunto',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctAnswer: 'Opción B',
          topic_id: '673abc123def456789012345',
          quiz_set_id: '673set123def456789012345',
          order: 2,
          status: 'approved'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Conjunto de quizzes no encontrado' })
  findByQuizSet(@Param('quizSetId') quizSetId: string) {
    return this.quizService.findByQuizSet(quizSetId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener quiz por ID',
    description: 'Obtiene la información completa de un quiz específico incluyendo la pregunta, opciones y respuesta correcta.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del quiz',
    example: '673quiz123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quiz encontrado',
    schema: {
      example: {
        _id: '673quiz123def456789012345',
        question: '¿Cuál es la capital de Francia?',
        options: ['Londres', 'París', 'Madrid', 'Roma'],
        correctAnswer: 'París',
        topic_id: {
          _id: '673abc123def456789012345',
          topic_name: 'geografia-europa',
          description: 'Geografía de Europa'
        },
        quiz_set_id: {
          _id: '673set123def456789012345',
          name: 'Capitales Europeas'
        },
        order: 1,
        created_by: {
          _id: '673user123def456789012345',
          user_name: 'profesor1',
          role: 'docente'
        },
        organization_id: null,
        status: 'approved',
        reviewed_by: {
          _id: '673admin123def456789012345',
          user_name: 'admin'
        },
        reviewed_at: '2024-11-17T12:00:00.000Z',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Quiz no encontrado' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar quiz',
    description: 'Actualiza la información de un quiz existente. Solo el creador o un admin pueden actualizarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del quiz a actualizar',
    example: '673quiz123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar del quiz',
    type: UpdateQuizDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar pregunta y opciones',
        value: {
          question: '¿Cuál es la capital de España?',
          options: ['Barcelona', 'Madrid', 'Valencia', 'Sevilla'],
          correctAnswer: 'Madrid'
        }
      },
      ejemplo2: {
        summary: 'Cambiar orden',
        value: {
          order: 5
        }
      },
      ejemplo3: {
        summary: 'Actualizar completo',
        value: {
          question: '¿Qué es JavaScript?',
          options: [
            'Un lenguaje de programación',
            'Un framework',
            'Una base de datos',
            'Un sistema operativo'
          ],
          correctAnswer: 'Un lenguaje de programación',
          order: 3
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quiz actualizado exitosamente',
    schema: {
      example: {
        _id: '673quiz123def456789012345',
        question: '¿Cuál es la capital de España?',
        options: ['Barcelona', 'Madrid', 'Valencia', 'Sevilla'],
        correctAnswer: 'Madrid',
        topic_id: '673abc123def456789012345',
        order: 1,
        status: 'draft',
        updatedAt: '2024-11-17T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Quiz no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo el creador o admin' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Roles('docente', 'admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar quiz',
    description: 'Elimina permanentemente un quiz del sistema. Solo el creador o un admin pueden eliminarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del quiz a eliminar',
    example: '673quiz123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quiz eliminado exitosamente',
    schema: {
      example: {
        message: 'Quiz eliminado exitosamente',
        _id: '673quiz123def456789012345'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Quiz no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo el creador o admin' })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
