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
  Delete,
  Patch,
  UseInterceptors,
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
import { UserListDTO, UserAdminDTO, UpdateUserDTO } from './dto/user.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
import { CreateUserAddressDTO, UserAddressDTO } from './dto/user-address.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @UseInterceptors(PaginationInterceptor)
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
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: UserListDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.userService.getActiveUsers(page, limit);
    const total = await this.userService.countActiveUsers();
    return {
      data: plainToInstance(UserListDTO, data, {
        excludeExtraneousValues: true,
      }),
      total,
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
      additionalInformation: savedAddress.additionalInformation,
      referencePoint: savedAddress.referencePoint,
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
      additionalInformation: address.additionalInformation,
      referencePoint: address.referencePoint,
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
        additionalInformation: address.additionalInformation,
        referencePoint: address.referencePoint,
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
      additionalInformation: updatedAddress.additionalInformation,
      referencePoint: updatedAddress.referencePoint,
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
