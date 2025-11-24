import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: `
Autentica un usuario y devuelve un token JWT.

**Notas importantes:**
- Los usuarios con status 'pending', 'suspended' o 'rejected' no pueden hacer login
- El token expira en 24 horas (configurable con JWT_EXPIRES_IN)
- Guarda el token para usarlo en requests subsecuentes
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve token JWT y datos del usuario.',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzNhYmMxMjNkZWY0NTY3ODkwMTIzNDUiLCJ1c2VyX25hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTczMTc5MjAwMCwiZXhwIjoxNzMxODc4NDAwfQ.signature',
        user: {
          _id: '673abc123def456789012345',
          user_name: 'admin',
          role: 'admin',
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o usuario no activo',
    schema: {
      example: {
        statusCode: 401,
        message: 'Contraseña incorrecta',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.user_name,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: `
Registra un nuevo usuario en el sistema.

**Comportamiento según rol:**
- **Estudiantes**: Quedan activos automáticamente y reciben token
- **Docentes**: Quedan en estado 'pending', requieren aprobación de admin

**Campos requeridos:**
- user_name (único)
- password (mínimo 6 caracteres)
- role (docente, estudiante)
    `,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '673abc123def456789012346',
          user_name: 'estudiante1',
          role: 'estudiante',
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o incompletos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'password must be longer than or equal to 6 characters',
          'user_name should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Usuario ya existe',
    schema: {
      example: {
        statusCode: 409,
        message: 'El nombre de usuario ya existe',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve la información del usuario basándose en el token JWT proporcionado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        _id: '673abc123def456789012345',
        user_name: 'admin',
        role: 'admin',
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado o token inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido o expirado',
        error: 'Unauthorized',
      },
    },
  })
  getProfile(@GetUser() user: any) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Post('verify')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Verificar validez del token JWT',
    description:
      'Verifica si el token JWT proporcionado es válido y no ha expirado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          _id: '673abc123def456789012345',
          user_name: 'admin',
          role: 'admin',
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido o expirado',
        error: 'Unauthorized',
      },
    },
  })
  verifyToken(@GetUser() user: any) {
    return {
      valid: true,
      user,
    };
  }
}
