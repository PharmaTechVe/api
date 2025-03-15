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
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { UserService } from 'src/user/user.service';
import { generateOTP } from 'src/utils/string';
import { EmailService } from 'src/email/email.service';
import { OtpDTO } from 'src/user/dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send email with reset password link' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    const user = await this.userService.findByEmail(forgotPasswordDTO.email);
    const otp = generateOTP(6);
    await this.userService.saveOTP(user, otp);
    this.emailService.sendEmail({
      recipients: [{ email: user.email, name: user.firstName }],
      subject: 'Reset your password',
      html: `<p>Your OTP is <b>${otp}</b></p>`,
      text: `Your OTP is ${otp}`,
    });
    return HttpStatus.NO_CONTENT;
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDTO })
  async resetPassword(@Body() otp: OtpDTO): Promise<LoginResponseDTO> {
    const user = await this.userService.findByOTP(otp.otp);
    const result = await this.authService.generateToken(user);
    await this.userService.deleteOTP(otp.otp, user);
    return result;
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
