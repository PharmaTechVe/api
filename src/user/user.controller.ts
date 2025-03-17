import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { OtpDTO } from './dto/otp.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':userId/validate')
  @ApiOperation({ summary: 'Validate OTP to verify email' })
  @ApiResponse({ status: 204, description: 'OTP validated successfully' })
  @ApiResponse({ status: 400, description: 'OTP code has expired' })
  @ApiResponse({ status: 404, description: 'Invalid or not found OTP code' })
  async validateEmail(
    @Param('userId') userId: string,
    @Body() otpDto: OtpDTO,
  ): Promise<void> {
    await this.userService.validateEmail(userId, otpDto);
  }
}
