import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from 'src/user/user.service';
import { LoginDTO, LoginResponseDTO } from './dto/login.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<LoginResponseDTO> {
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

  async signUp(signUpDTO: UserDTO) {
    const existingUser = await this.userService.findByEmail(signUpDTO.email);
    if (existingUser) {
      throw new BadRequestException('The email is already in use');
    }

    const hashedPassword = await bcrypt.hash(signUpDTO.password, 10);

    const newUserData = {
      ...signUpDTO,
      password: hashedPassword,
    };

    const newUser = await this.userService.create(newUserData);

    return plainToInstance(User, newUser);
  }
}
