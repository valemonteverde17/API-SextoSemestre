import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('API Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Información de la API',
    description: 'Endpoint raíz que proporciona información básica sobre la API de CiberEduca. Público para todos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de la API',
    schema: {
      example: {
        message: 'Bienvenido a CiberEduca API',
        version: '1.0.0',
        description: 'Sistema de Gestión Educativa',
        documentation: '/api',
        endpoints: {
          auth: '/auth',
          users: '/users',
          topics: '/topics',
          organizations: '/organizations',
          quizzes: '/quizzes',
          quizSets: '/quiz-sets',
          scores: '/scores',
          results: '/results',
          games: {
            hangman: '/hangman',
            memorama: '/memorama'
          }
        }
      }
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
