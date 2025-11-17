import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  _id: string;
  user_name: string;
  email?: string;
  role: string;
  organization_id?: string;
  status: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      throw new UnauthorizedException(
        `Usuario ${user.status}. Contacte al administrador.`
      );
    }

    // Remover password del objeto
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const userId = user._id || user.id;
    const orgId = user.organization_id;
    
    const payload: JwtPayload = {
      _id: userId.toString(),
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      organization_id: orgId ? orgId.toString() : undefined,
      status: user.status,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: userId,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        organization_id: orgId,
        status: user.status,
        profile: user.profile,
        permissions: user.permissions,
      },
    };
  }

  async register(createUserDto: any) {
    const user: any = await this.usersService.create(createUserDto);
    const userObj = user.toObject ? user.toObject() : user;
    
    // Si el usuario queda activo, generar token
    if (userObj.status === 'active') {
      return this.login(userObj);
    }
    
    // Si queda pendiente, retornar sin token
    return {
      message: 'Usuario registrado. Esperando aprobación del administrador.',
      user: {
        _id: userObj._id,
        user_name: userObj.user_name,
        role: userObj.role,
        status: userObj.status,
      },
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
