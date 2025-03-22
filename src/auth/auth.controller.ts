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
import { Request } from 'express';
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
import { OTPType } from 'src/user/entities/user-otp.entity';

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
  login(
    @Req() request: Request,
    @Body() loginDTO: LoginDTO,
  ): Promise<LoginResponseDTO> {
    return this.authService.login(loginDTO, request.headers.origin);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @ApiResponse({ status: HttpStatus.CREATED })
  async register(@Body() signUpDTO: UserDTO) {
    const user = await this.authService.signUp(signUpDTO);
    const otp = generateOTP(6);
    await this.userService.saveOTP(user, otp, OTPType.EMAIL);

    await this.emailService.sendEmailByTemaplte(
      'otp_verification',
      {
        recipients: [{ email: user.email, name: user.firstName }],
        subject: 'Email Verification',
      },
      otp,
    );

    return user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send email with reset password link' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    const user = await this.userService.findByEmail(forgotPasswordDTO.email);

    let otp: string;
    try {
      otp = user.otp.code;
    } catch {
      otp = generateOTP(6);
      await this.userService.saveOTP(user, otp, OTPType.PASSWORD);
    }
    await this.emailService.sendEmail({
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

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Send OTP for email verification to authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'OTP sent successfully',
  })
  async sendOtp(@Req() req: CustomRequest): Promise<number> {
    const user = req.user;
    let otp: string;
    try {
      otp = user.otp.code;
    } catch {
      otp = generateOTP(6);
      await this.userService.saveOTP(user, otp, OTPType.EMAIL);
    }

    await this.emailService.sendEmailByTemaplte(
      'otp_verification',
      {
        recipients: [{ email: user.email, name: user.firstName }],
        subject: 'Email Verification',
      },
      otp,
    );

    return HttpStatus.NO_CONTENT;
  }
}
