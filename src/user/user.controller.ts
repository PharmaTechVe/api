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
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  getSchemaPath,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { OtpDTO } from './dto/otp.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { User, UserRole } from './entities/user.entity';
import { UserOrAdminGuard } from 'src/auth/user-or-admin.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserListDTO } from './dto/user-list.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { plainToInstance } from 'class-transformer';
import { CreateUserAddressDTO } from './dto/create-user-address.dto';
import { UserAddressDTO } from './dto/reponse-user-address.dto';
import { UpdateUserDTO } from './dto/user-update.dto';
import { UserAdminDTO } from './dto/user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @Post('otp')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile details' })
  @ApiResponse({ status: HttpStatus.OK, type: UserListDTO })
  async getProfile(@Param('userId') userId: string): Promise<UserListDTO> {
    const user = await this.userService.getUserProfile(userId);
    return plainToInstance(UserListDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List of active users',
    description:
      'Returns all active and validated users, including their associated profile.',
  })
  @ApiOkResponse({
    description: 'Users successfully obtained',
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
    const baseUrl = this.configService.get<string>('API_URL') + req.path;
    const totalItems = await this.userService.countActiveUsers();
    const { next, previous } = getPaginationUrl(
      baseUrl,
      page,
      limit,
      totalItems,
    );
    const users = await this.userService.getActiveUsers(page, limit);
    const usersDTO = plainToInstance(UserListDTO, users, {
      excludeExtraneousValues: true,
    });

    return {
      results: usersDTO,
      count: totalItems,
      next,
      previous,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  @UseGuards(AuthGuard, UserOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user logically' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden action',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    await this.userService.deleteUser(userId);
  }

  @UseGuards(AuthGuard)
  @Post(':userId/address')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new address for the user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateUserAddressDTO })
  async createAddress(
    @Param('userId') userId: string,
    @Body() createAddressDto: CreateUserAddressDTO,
  ): Promise<CreateUserAddressDTO> {
    const savedAddress = await this.userService.createAddress(
      userId,
      createAddressDto,
    );

    return plainToInstance(CreateUserAddressDTO, {
      adress: savedAddress.adress,
      zipCode: savedAddress.zipCode,
      latitude: savedAddress.latitude,
      longitude: savedAddress.longitude,
      cityId: savedAddress.city.id,
    });
  }

  @Get(':userId/address/:addressId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get details of a specific address (admin or same user)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserAddressDTO })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async getAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<UserAddressDTO> {
    const address = await this.userService.getAddress(userId, addressId);

    return plainToInstance(UserAddressDTO, {
      id: address.id,
      adress: address.adress,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude,
      cityId: address.city.id,
      nameCity: address.city.name,
      nameState: address.city.state.name,
      nameCountry: address.city.state.country.name,
    });
  }

  @Get(':userId/address')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List addresses for a user (admin or same user)' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserAddressDTO] })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async getListAddresses(
    @Param('userId') userId: string,
  ): Promise<UserAddressDTO[]> {
    const addresses = await this.userService.getListAddresses(userId);
    return addresses.map((address) =>
      plainToInstance(UserAddressDTO, {
        id: address.id,
        adress: address.adress,
        zipCode: address.zipCode,
        latitude: address.latitude,
        longitude: address.longitude,
        cityId: address.city.id,
        nameCity: address.city.name,
        nameState: address.city.state.name,
        nameCountry: address.city.state.country.name,
      }),
    );
  }

  @Delete(':userId/address/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete (soft delete) an address (admin or same user)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Address deleted successfully',
  })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async deleteAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.userService.deleteAddress(userId, addressId);
  }

  @Patch(':userId/address/:addressId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an address partially (admin or same user)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserAddressDTO })
  @UseGuards(AuthGuard, UserOrAdminGuard)
  async updateAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateData: Partial<CreateUserAddressDTO>,
  ): Promise<UserAddressDTO> {
    const updatedAddress = await this.userService.updateAddress(
      userId,
      addressId,
      updateData,
    );
    return plainToInstance(UserAddressDTO, {
      id: updatedAddress.id,
      adress: updatedAddress.adress,
      zipCode: updatedAddress.zipCode,
      latitude: updatedAddress.latitude,
      longitude: updatedAddress.longitude,
      cityId: updatedAddress.city.id,
      nameCity: updatedAddress.city.name,
      nameState: updatedAddress.city.state.name,
      nameCountry: updatedAddress.city.state.country.name,
    });
  }

  @Patch(':userId')
  @UseGuards(AuthGuard, UserOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserListDTO })
  async UpdateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserListDTO> {
    await this.userService.updateUser(userId, updateUserDto);
    await this.userService.updateProfile(userId, updateUserDto);
    const userUpdated = await this.userService.findUserById(userId);
    return plainToInstance(UserListDTO, userUpdated, {
      excludeExtraneousValues: true,
    });
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserListDTO })
  async createUser(@Body() createUserDto: UserAdminDTO): Promise<UserListDTO> {
    const user = await this.userService.createAdmin(createUserDto);
    return plainToInstance(UserListDTO, user, {
      excludeExtraneousValues: true,
    });
  }
}
