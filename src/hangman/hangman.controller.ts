import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { CreateHangmanDto } from './dto/create-hangman.dto';
import { UpdateHangmanDto } from './dto/update-hangman.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Juegos')
@ApiBearerAuth('bearer')
@Controller('hangman')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class HangmanController {
  constructor(private readonly hangmanService: HangmanService) {}

  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ 
    summary: 'Crear juego de Ahorcado',
    description: 'Crea un nuevo juego de ahorcado asociado a un topic. Solo docentes y admins pueden crear juegos.'
  })
  @ApiBody({
    description: 'Datos del juego de ahorcado',
    type: CreateHangmanDto,
    examples: {
      ejemplo1: {
        summary: 'Ahorcado Simple',
        value: {
          topic_id: '673abc123def456789012345',
          user_id: '673user123def456789012345',
          title: 'Capitales de Europa',
          word: 'PARIS',
          hint: 'Capital de Francia'
        }
      },
      ejemplo2: {
        summary: 'Ahorcado de Programación',
        value: {
          topic_id: '673abc456def789012345678',
          user_id: '673user123def456789012345',
          title: 'Términos de JavaScript',
          word: 'VARIABLE',
          hint: 'Contenedor de datos en programación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Juego creado exitosamente',
    schema: {
      example: {
        _id: '673hang123def456789012345',
        topic_id: '673abc123def456789012345',
        user_id: '673user123def456789012345',
        title: 'Capitales de Europa',
        word: 'PARIS',
        hint: 'Capital de Francia',
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
  create(@Body() createHangmanDto: CreateHangmanDto) {
    return this.hangmanService.create(createHangmanDto);
  }

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Listar juegos de Ahorcado',
    description: 'Obtiene la lista de juegos de ahorcado. Puede filtrar por topic. Público para todos.'
  })
  @ApiQuery({ 
    name: 'topic_id', 
    required: false, 
    description: 'Filtrar por ID del topic',
    example: '673abc123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de juegos',
    schema: {
      example: [
        {
          _id: '673hang123def456789012345',
          topic_id: {
            _id: '673abc123def456789012345',
            topic_name: 'geografia-europa'
          },
          title: 'Capitales de Europa',
          word: 'PARIS',
          hint: 'Capital de Francia',
          status: 'approved',
          createdAt: '2024-11-17T10:00:00.000Z'
        },
        {
          _id: '673hang456def789012345678',
          topic_id: {
            _id: '673abc456def789012345678',
            topic_name: 'javascript-fundamentos'
          },
          title: 'Términos de JavaScript',
          word: 'VARIABLE',
          hint: 'Contenedor de datos',
          status: 'approved',
          createdAt: '2024-11-16T08:00:00.000Z'
        }
      ]
    }
  })
  findAll(@Query() query: any) {
    return this.hangmanService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener juego por ID',
    description: 'Obtiene la información completa de un juego de ahorcado específico. Público para todos.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del juego',
    example: '673hang123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Juego encontrado',
    schema: {
      example: {
        _id: '673hang123def456789012345',
        topic_id: {
          _id: '673abc123def456789012345',
          topic_name: 'geografia-europa',
          description: 'Geografía de Europa'
        },
        user_id: {
          _id: '673user123def456789012345',
          user_name: 'profesor1'
        },
        title: 'Capitales de Europa',
        word: 'PARIS',
        hint: 'Capital de Francia',
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
  @ApiResponse({ status: 404, description: 'Juego no encontrado' })
  findOne(@Param('id') id: string) {
    return this.hangmanService.findOne(id);
  }

  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar juego',
    description: 'Actualiza un juego de ahorcado existente. Solo el creador o un admin pueden actualizarlo.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del juego a actualizar',
    example: '673hang123def456789012345'
  })
  @ApiBody({
    description: 'Datos a actualizar',
    type: UpdateHangmanDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar palabra y pista',
        value: {
          word: 'MADRID',
          hint: 'Capital de España'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Juego actualizado',
    schema: {
      example: {
        _id: '673hang123def456789012345',
        title: 'Capitales de Europa',
        word: 'MADRID',
        hint: 'Capital de España',
        updatedAt: '2024-11-17T15:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Juego no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateHangmanDto: UpdateHangmanDto) {
    return this.hangmanService.update(id, updateHangmanDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar juego',
    description: 'Elimina permanentemente un juego de ahorcado. Solo admins pueden eliminar juegos.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del juego a eliminar',
    example: '673hang123def456789012345'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Juego eliminado',
    schema: {
      example: {
        message: 'Juego de ahorcado eliminado exitosamente',
        _id: '673hang123def456789012345'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Juego no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado - Solo admins' })
  remove(@Param('id') id: string) {
    return this.hangmanService.remove(id);
  }
}
