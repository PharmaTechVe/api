import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(loginDTO.email);
    if (user == null) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPassMatch = await bcrypt.compare(loginDTO.password, user.password);
    if (!isPassMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
