import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { OtpDTO } from './dto/otp.dto';
import { ProfileDTO } from './dto/profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { UserOrAdminGuard } from 'src/auth/user-or-admin.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { Role } from 'src/auth/rol.enum';
import { UserListDTO } from './dto/user-list.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @Post('otp')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Validate OTP to verify email' })
  @ApiResponse({ status: 204, description: 'OTP validated successfully' })
  @ApiResponse({ status: 400, description: 'OTP code has expired' })
  @ApiResponse({ status: 404, description: 'Invalid or not found OTP code' })
  async validateOtp(
    @Req() req: Request & { user?: User },
    @Body() otpDto: OtpDTO,
  ): Promise<void> {
    const loggedUser = req.user;
    if (!loggedUser) {
      throw new ForbiddenException('User not authenticated.');
    }

    const userOtp = await this.userService.findUserOtpByUserAndCode(
      loggedUser.id,
      otpDto.otp,
    );
    if (!userOtp) {
      throw new NotFoundException('Invalid or not found OTP code');
    }
    await this.userService.validateEmail(userOtp);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':userId')
  @UseGuards(AuthGuard, UserOrAdminGuard)
  @ApiOperation({ summary: 'Get user profile details' })
  @ApiResponse({ status: HttpStatus.OK })
  async getProfile(@Param('userId') userId: string): Promise<ProfileDTO> {
    return this.userService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'List of active users',
    description:
      'Returns all active and validated users, including their associated profile.',
  })
  @ApiOkResponse({
    description: 'Successfully obtained users.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(UserListDTO) },
            },
          },
        },
      ],
    },
  })
  async getActiveUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ): Promise<PaginationDTO<UserListDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const totalItems = await this.userService.countActiveUsers();
    const { next, previous } = getPaginationUrl(
      baseUrl,
      page,
      limit,
      totalItems,
    );
    const users = await this.userService.getActiveUsers(page, limit);
    return {
      results: users,
      count: totalItems,
      next,
      previous,
    };
  }
}
