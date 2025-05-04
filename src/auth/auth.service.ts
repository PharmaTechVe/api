import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { plainToInstance } from 'class-transformer';
import { UserService } from 'src/user/user.service';
import { LoginDTO, LoginResponseDTO } from './dto/login.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async generateToken(user: User): Promise<LoginResponseDTO> {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async login(
    loginDTO: LoginDTO,
    origin: string | undefined,
  ): Promise<LoginResponseDTO> {
    if (origin === undefined) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userService.findByEmail(loginDTO.email);
    if (user == null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPassMatch = await bcrypt.compare(loginDTO.password, user.password);
    if (!isPassMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const allowedAdminHosts = this.configService.get<string>(
      'ALLOWED_ADMIN_ORIGIN',
      '',
    );
    const allowedOrigins = allowedAdminHosts
      .split(',')
      .map((host) => host.trim());
    if (
      [UserRole.CUSTOMER, UserRole.DELIVERY].includes(user.role) &&
      allowedOrigins.includes(origin)
    ) {
      throw new ForbiddenException('Access denied');
    }
    return this.generateToken(user);
  }

  async signUp(signUpDTO: UserDTO) {
    const emailUsed = await this.userService.userExists({
      email: signUpDTO.email,
    });
    if (emailUsed) {
      throw new BadRequestException('The email is already in use');
    }
    const documentUsed = await this.userService.userExists({
      documentId: signUpDTO.documentId,
    });
    if (documentUsed) {
      throw new BadRequestException('The document is already in use');
    }
    const hashedPassword = await this.encryptPassword(signUpDTO.password);
    const newUserData = {
      ...signUpDTO,
      password: hashedPassword,
    };
    const newUser = await this.userService.create(newUserData);

    return plainToInstance(User, newUser);
  }

  async updatePassword(user: User, newPasswod: string): Promise<boolean> {
    const password = await this.encryptPassword(newPasswod);
    await this.userService.update(user, { password });
    return true;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async validateUserWs(client: Socket) {
    const token = client.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      client.disconnect();
      return;
    }
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch {
      client.disconnect();
      return;
    }
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      client.disconnect();
      return;
    }
    await this.userService.setWsId(user.email, client.id);
  }

  async disconnectUserWs(client: Socket) {
    await this.userService.removeWsId(client.id);
  }
}
