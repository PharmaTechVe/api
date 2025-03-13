import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResponseDTO } from './dto/login.dto';
import { UserCreateDTO } from 'src/user/dto/user-create.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDTO })
  login(@Body() loginDTO: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(loginDTO);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @ApiResponse({ status: HttpStatus.CREATED })
  async register(@Body() signUpDTO: UserCreateDTO) {
    return await this.authService.signUp(signUpDTO);
  }
}
