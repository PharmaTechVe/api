import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { ProfileDTO } from './dto/profile.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile details' })
  @ApiResponse({ status: HttpStatus.OK })
  async getProfile(@Param('userId') userId: string): Promise<ProfileDTO> {
    return this.userService.getUserProfile(userId);
  }
}
