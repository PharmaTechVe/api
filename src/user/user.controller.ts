import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { User, UserRole } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserListDTO } from './dto/user-list.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({
    summary: 'List registered users',
    description:
      'Returns a paginated list of registered users (only accessible by administrators).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Current page',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Records per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of registered users',
    type: [UserListDTO],
  })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) currentPage: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request & { user?: User },
  ): Promise<{
    users: User[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }> {
    const user = req.user;
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Access Denied: Only administrators can access this information.',
      );
    }

    return await this.userService.findActiveUsers(currentPage, limit);
  }
}
