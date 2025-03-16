import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResponseDTO } from './dto/login.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard, CustomRequest } from './auth.guard';
import { PasswordDTO } from './dto/password.dto';

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
  async register(@Body() signUpDTO: UserDTO) {
    return await this.authService.signUp(signUpDTO);
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async updatePassword(
    @Req()
    req: CustomRequest,
    @Body()
    passwordDTO: PasswordDTO,
  ) {
    const isUpdated = await this.authService.updatePassword(
      req.user,
      passwordDTO.password,
    );
    if (!isUpdated) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.NO_CONTENT;
  }
}
