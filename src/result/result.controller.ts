import { Controller, Get, Post, Body, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Resultados')
@ApiBearerAuth('bearer')
@Controller('results')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Registrar resultado de quiz',
    description: 'Registra la respuesta de un usuario a una pregunta específica de un quiz. Almacena si la respuesta fue correcta o incorrecta.'
  })
  @ApiBody({
    description: 'Datos del resultado',
    type: CreateResultDto,
    examples: {
      ejemplo1: {
        summary: 'Respuesta Correcta',
        value: {
          user_id: '673user123def456789012345',
          quiz_id: '673quiz123def456789012345',
          selectedAnswer: 'París',
          isCorrect: true
        }
      },
      ejemplo2: {
        summary: 'Respuesta Incorrecta',
        value: {
          user_id: '673user456def789012345678',
          quiz_id: '673quiz123def456789012345',
          selectedAnswer: 'Londres',
          isCorrect: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Resultado registrado exitosamente',
    schema: {
      example: {
        _id: '673result123def456789012345',
        user_id: '673user123def456789012345',
        quiz_id: '673quiz123def456789012345',
        selectedAnswer: 'París',
        isCorrect: true,
        createdAt: '2024-11-17T10:00:00.000Z',
        updatedAt: '2024-11-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Resultados de usuario',
    description: 'Obtiene todos los resultados (respuestas) registrados de un usuario específico en todos los quizzes.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de resultados del usuario',
    schema: {
      example: [
        {
          _id: '673result123def456789012345',
          user_id: '673user123def456789012345',
          quiz_id: {
            _id: '673quiz123def456789012345',
            question: '¿Cuál es la capital de Francia?',
            correctAnswer: 'París'
          },
          selectedAnswer: 'París',
          isCorrect: true,
          createdAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673result456def789012345678',
          user_id: '673user123def456789012345',
          quiz_id: {
            _id: '673quiz456def789012345678',
            question: '¿Qué método agrega elementos a un array?',
            correctAnswer: 'push()'
          },
          selectedAnswer: 'push()',
          isCorrect: true,
          createdAt: '2024-11-17T10:01:00.000Z'
        },
        {
          _id: '673result789def012345678901',
          user_id: '673user123def456789012345',
          quiz_id: {
            _id: '673quiz789def012345678901',
            question: '¿Cuál es la capital de España?',
            correctAnswer: 'Madrid'
          },
          selectedAnswer: 'Barcelona',
          isCorrect: false,
          createdAt: '2024-11-17T10:02:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUser(@Param('userId') userId: string) {
    return this.resultService.findByUser(userId);
  }

  @Get('score/:userId/:topicId')
  @ApiOperation({ 
    summary: 'Puntuación por topic',
    description: 'Calcula y obtiene la puntuación de un usuario en un topic específico basándose en sus respuestas correctas e incorrectas.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: '673user123def456789012345'
  })
  @ApiParam({ 
    name: 'topicId', 
    description: 'ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Puntuación calculada',
    schema: {
      example: {
        user_id: '673user123def456789012345',
        topic_id: '673abc123def456789012345',
        total_questions: 10,
        correct_answers: 8,
        incorrect_answers: 2,
        score: 80,
        percentage: '80%',
        results: [
          {
            quiz_id: '673quiz123def456789012345',
            question: '¿Cuál es la capital de Francia?',
            selectedAnswer: 'París',
            correctAnswer: 'París',
            isCorrect: true
          },
          {
            quiz_id: '673quiz456def789012345678',
            question: '¿Cuál es la capital de España?',
            selectedAnswer: 'Barcelona',
            correctAnswer: 'Madrid',
            isCorrect: false
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario o topic no encontrado' })
  getScore(@Param('userId') userId: string, @Param('topicId') topicId: string) {
    return this.resultService.getScoreByTopic(userId, topicId);
  }
  
  @Public()
  @Get('ranking/global')
  @ApiOperation({ 
    summary: 'Ranking global de resultados',
    description: 'Obtiene el ranking global de usuarios basado en sus resultados totales (respuestas correctas). Público para todos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking global obtenido',
    schema: {
      example: [
        {
          user_id: '673user123def456789012345',
          user_name: 'estudiante1',
          total_answers: 150,
          correct_answers: 135,
          incorrect_answers: 15,
          accuracy: 90,
          rank: 1
        },
        {
          user_id: '673user456def789012345678',
          user_name: 'estudiante2',
          total_answers: 140,
          correct_answers: 119,
          incorrect_answers: 21,
          accuracy: 85,
          rank: 2
        },
        {
          user_id: '673user789def012345678901',
          user_name: 'estudiante3',
          total_answers: 130,
          correct_answers: 104,
          incorrect_answers: 26,
          accuracy: 80,
          rank: 3
        }
      ]
    }
  })
  getRanking() {
    return this.resultService.getGlobalRanking();
  }

}
