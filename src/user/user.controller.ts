import {
  Controller,
  Get,
  Query,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { User, UserRole } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Current page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Registered Users',
  })
  async getActiveUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: Request & { user?: User },
  ): Promise<{ data: User[]; total: number; page: number; lastPage: number }> {
    const user = req.user as User;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Access Denied: Only administrators can access this information.',
      );
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    return this.userService.findActiveUsers(pageNumber, limitNumber);
  }
}
