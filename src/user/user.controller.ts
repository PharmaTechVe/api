import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { OtpDTO } from './dto/otp.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':userId/validate')
  @ApiOperation({ summary: 'Validar OTP para verificar el correo electrónico' })
  @ApiResponse({ status: 204, description: 'OTP validado correctamente' })
  @ApiResponse({ status: 400, description: 'El código OTP ha expirado' })
  @ApiResponse({
    status: 404,
    description: 'Código OTP inválido o no encontrado',
  })
  async validateEmail(
    @Param('userId') userId: string,
    @Body() otpDto: OtpDTO,
  ): Promise<void> {
    await this.userService.validateEmail(userId, otpDto);
  }
}
