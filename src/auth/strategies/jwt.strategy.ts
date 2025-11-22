import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKeyCiberEduca2025', // Fallback solo para desarrollo
    });
  }

  async validate(payload: any) {
    // ✅ VALIDAR QUE EL USUARIO AÚN EXISTA EN LA BASE DE DATOS
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // ✅ VALIDAR QUE EL USUARIO ESTÉ ACTIVO
    if (user.status !== 'active' && user.role !== 'admin') {
      throw new UnauthorizedException('User account is not active');
    }

    return { 
      userId: payload.sub, 
      username: user.user_name, 
      role: user.role,
      status: user.status 
    };
  }
}
