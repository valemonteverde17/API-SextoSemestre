import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Scores')
@ApiBearerAuth('bearer')
@Controller('scores')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Registrar puntuación',
    description: 'Registra la puntuación de un usuario al completar un quiz-set. Solo se permite una puntuación por usuario por quiz-set.'
  })
  @ApiBody({
    description: 'Datos de la puntuación',
    type: CreateScoreDto,
    examples: {
      ejemplo1: {
        summary: 'Puntuación Alta',
        value: {
          user_id: '673user123def456789012345',
          quiz_set_id: '673set123def456789012345',
          topic_id: '673abc123def456789012345',
          score: 95,
          total_questions: 10,
          correct_answers: 9,
          time_taken: 180
        }
      },
      ejemplo2: {
        summary: 'Puntuación Media',
        value: {
          user_id: '673user456def789012345678',
          quiz_set_id: '673set123def456789012345',
          topic_id: '673abc123def456789012345',
          score: 70,
          total_questions: 10,
          correct_answers: 7,
          time_taken: 240
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Puntuación registrada exitosamente',
    schema: {
      example: {
        _id: '673score123def456789012345',
        user_id: '673user123def456789012345',
        quiz_set_id: '673set123def456789012345',
        topic_id: '673abc123def456789012345',
        score: 95,
        total_questions: 10,
        correct_answers: 9,
        time_taken: 180,
        completed_at: '2024-11-17T10:00:00.000Z',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o puntuación duplicada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(createScoreDto);
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ 
    summary: 'Listar todas las puntuaciones',
    description: 'Obtiene la lista completa de puntuaciones registradas. Solo admins pueden ver todas las puntuaciones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de puntuaciones',
    schema: {
      example: [
        {
          _id: '673score123def456789012345',
          user_id: {
            _id: '673user123def456789012345',
            user_name: 'estudiante1'
          },
          quiz_set_id: {
            _id: '673set123def456789012345',
            quiz_name: 'Evaluación JavaScript'
          },
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'javascript-fundamentos'
          },
          score: 95,
          total_questions: 10,
          correct_answers: 9,
          time_taken: 180,
          completed_at: '2024-11-17T10:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  findAll() {
    return this.scoresService.findAll();
  }

  // Rutas específicas primero (antes de :id)
  @Public()
  @Get('ranking/global')
  @ApiOperation({ 
    summary: 'Ranking global',
    description: 'Obtiene el ranking global de usuarios ordenado por puntuación total. Público para todos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking global obtenido',
    schema: {
      example: [
        {
          user_id: '673user123def456789012345',
          user_name: 'estudiante1',
          total_score: 950,
          quizzes_completed: 10,
          average_score: 95,
          rank: 1
        },
        {
          user_id: '673user456def789012345678',
          user_name: 'estudiante2',
          total_score: 850,
          quizzes_completed: 10,
          average_score: 85,
          rank: 2
        },
        {
          user_id: '673user789def012345678901',
          user_name: 'estudiante3',
          total_score: 750,
          quizzes_completed: 10,
          average_score: 75,
          rank: 3
        }
      ]
    }
  })
  getGlobalRanking() {
    return this.scoresService.getGlobalRanking();
  }

  @Roles('admin')
  @Get('debug/all-scores')
  @ApiOperation({ 
    summary: 'Debug - Ver todas las puntuaciones',
    description: 'Endpoint de debug para ver todas las puntuaciones sin filtros. Solo para admins.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Todas las puntuaciones'
  })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  debugAllScores() {
    return this.scoresService.findAll();
  }

  @Public()
  @Get('ranking/quiz-set/:quizSetId')
  @ApiOperation({ 
    summary: 'Ranking por quiz-set',
    description: 'Obtiene el ranking de usuarios para un quiz-set específico. Público para todos.'
  })
  @ApiParam({ 
    name: 'quizSetId', 
    description: 'ID del quiz-set',
    example: '673set123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking del quiz-set',
    schema: {
      example: [
        {
          user_id: '673user123def456789012345',
          user_name: 'estudiante1',
          score: 95,
          correct_answers: 9,
          total_questions: 10,
          time_taken: 180,
          completed_at: '2024-11-17T10:00:00.000Z',
          rank: 1
        },
        {
          user_id: '673user456def789012345678',
          user_name: 'estudiante2',
          score: 85,
          correct_answers: 8,
          total_questions: 10,
          time_taken: 200,
          completed_at: '2024-11-17T10:05:00.000Z',
          rank: 2
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Quiz-set no encontrado' })
  getQuizSetRanking(@Param('quizSetId') quizSetId: string) {
    return this.scoresService.getQuizSetRanking(quizSetId);
  }

  @Get('stats/:userId')
  @ApiOperation({ 
    summary: 'Estadísticas de usuario',
    description: 'Obtiene las estadísticas completas de un usuario: total de quizzes, promedio, mejor puntuación, etc.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas del usuario',
    schema: {
      example: {
        user_id: '673user123def456789012345',
        user_name: 'estudiante1',
        total_quizzes: 15,
        total_score: 1350,
        average_score: 90,
        best_score: 100,
        worst_score: 70,
        total_time: 3600,
        average_time: 240,
        topics_completed: [
          {
            topic_id: '673abc123def456789012345',
            topic_name: 'JavaScript',
            quizzes_completed: 5,
            average_score: 92
          },
          {
            topic_id: '673abc456def789012345678',
            topic_name: 'Python',
            quizzes_completed: 3,
            average_score: 88
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getUserStats(@Param('userId') userId: string) {
    return this.scoresService.getUserStats(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Puntuaciones de usuario',
    description: 'Obtiene todas las puntuaciones registradas de un usuario específico.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de puntuaciones del usuario',
    schema: {
      example: [
        {
          _id: '673score123def456789012345',
          quiz_set_id: {
            _id: '673set123def456789012345',
            quiz_name: 'Evaluación JavaScript'
          },
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'javascript-fundamentos'
          },
          score: 95,
          total_questions: 10,
          correct_answers: 9,
          time_taken: 180,
          completed_at: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673score456def789012345678',
          quiz_set_id: {
            _id: '673set456def789012345678',
            quiz_name: 'Evaluación Python'
          },
          score: 85,
          total_questions: 10,
          correct_answers: 8,
          time_taken: 200,
          completed_at: '2024-11-16T10:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUser(@Param('userId') userId: string) {
    return this.scoresService.findByUser(userId);
  }

  @Get('quiz-set/:quizSetId')
  @ApiOperation({ 
    summary: 'Puntuaciones por quiz-set',
    description: 'Obtiene todas las puntuaciones registradas para un quiz-set específico.'
  })
  @ApiParam({ 
    name: 'quizSetId', 
    description: 'ID del quiz-set',
    example: '673set123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de puntuaciones del quiz-set',
    schema: {
      example: [
        {
          _id: '673score123def456789012345',
          user_id: {
            _id: '673user123def456789012345',
            user_name: 'estudiante1'
          },
          score: 95,
          total_questions: 10,
          correct_answers: 9,
          time_taken: 180,
          completed_at: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673score456def789012345678',
          user_id: {
            _id: '673user456def789012345678',
            user_name: 'estudiante2'
          },
          score: 85,
          total_questions: 10,
          correct_answers: 8,
          time_taken: 200,
          completed_at: '2024-11-17T10:05:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Quiz-set no encontrado' })
  findByQuizSet(@Param('quizSetId') quizSetId: string) {
    return this.scoresService.findByQuizSet(quizSetId);
  }

  @Get('topic/:topicId')
  @ApiOperation({ 
    summary: 'Puntuaciones por topic',
    description: 'Obtiene todas las puntuaciones registradas para un topic específico.'
  })
  @ApiParam({ 
    name: 'topicId', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de puntuaciones del topic',
    schema: {
      example: [
        {
          _id: '673score123def456789012345',
          user_id: {
            _id: '673user123def456789012345',
            user_name: 'estudiante1'
          },
          quiz_set_id: {
            _id: '673set123def456789012345',
            quiz_name: 'Evaluación 1'
          },
          score: 95,
          completed_at: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673score456def789012345678',
          user_id: {
            _id: '673user456def789012345678',
            user_name: 'estudiante2'
          },
          quiz_set_id: {
            _id: '673set456def789012345678',
            quiz_name: 'Evaluación 2'
          },
          score: 85,
          completed_at: '2024-11-17T10:05:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Topic no encontrado' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.scoresService.findByTopic(topicId);
  }

  // Ruta genérica al final
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener puntuación por ID',
    description: 'Obtiene la información completa de una puntuación específica.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la puntuación',
    example: '673score123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Puntuación encontrada',
    schema: {
      example: {
        _id: '673score123def456789012345',
        user_id: {
          _id: '673user123def456789012345',
          user_name: 'estudiante1',
          email: 'estudiante1@example.com'
        },
        quiz_set_id: {
          _id: '673set123def456789012345',
          quiz_name: 'Evaluación JavaScript Básico',
          description: 'Evaluación de conceptos básicos'
        },
        topic_id: {
          _id: '673abc123def456789012345',
          topic_name: 'javascript-fundamentos',
          description: 'Fundamentos de JavaScript'
        },
        score: 95,
        total_questions: 10,
        correct_answers: 9,
        time_taken: 180,
        completed_at: '2024-11-17T10:00:00.000Z',
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Puntuación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.scoresService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar puntuación',
    description: 'Actualiza una puntuación existente. Solo admins pueden actualizar puntuaciones.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la puntuación a actualizar',
    example: '673score123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar',
    type: UpdateScoreDto,
    examples: {
      ejemplo1: {
        summary: 'Corregir puntuación',
        value: {
          score: 90,
          correct_answers: 9
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Puntuación actualizada',
    schema: {
      example: {
        _id: '673score123def456789012345',
        score: 90,
        correct_answers: 9,
        updatedAt: '2024-11-17T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Puntuación no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
    return this.scoresService.update(id, updateScoreDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar puntuación',
    description: 'Elimina permanentemente una puntuación del sistema. Solo admins pueden eliminar puntuaciones.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la puntuación a eliminar',
    example: '673score123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Puntuación eliminada',
    schema: {
      example: {
        message: 'Puntuación eliminada exitosamente',
        _id: '673score123def456789012345'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Puntuación no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.scoresService.remove(id);
  }
}
