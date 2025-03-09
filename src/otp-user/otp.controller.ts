import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidateEmailDto } from './dtos/validate-email.dto';
import { OtpService } from './otp.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    // DATOS DEL USUARIO
  };
}
@ApiTags('Email Validation')
@Controller('email')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('validate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 204, description: 'Correo validado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en la validación de datos.' })
  async validateEmail(
    @Body() validateEmailDto: ValidateEmailDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('Usuario no autenticado');
    }
    await this.otpService.validateUserEmail(user.id, validateEmailDto.code);
  }
}
