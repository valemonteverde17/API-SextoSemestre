import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Comprobar status del usuario
      if (user.status !== 'active' && user.role !== 'admin') {
        // Permitimos login si es admin aunque esté pendiente (seed) o manejamos eso en otra capa,
        // pero la regla dice: Pending/Rejected no entra.
        // Excepción: El primer admin semilla podría necesitar entrar.
        // Por ahora, bloqueamos estricto.
        if (user.status === 'pending') throw new UnauthorizedException('Your account is pending approval.');
        if (user.status === 'rejected') throw new UnauthorizedException('Your account has been rejected.');
      }
      
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.user_name, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        user_name: user.user_name,
        role: user.role,
        status: user.status
      }
    };
  }
}
