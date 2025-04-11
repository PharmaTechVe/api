import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentInformationService } from '../services/payment-information.service';
import {
  CreatePaymentInformationDTO,
  ResponsePaymentInformationDTO,
  UpdatePaymentInformationDTO,
} from '../dto/payment-information.dto';
import { PaymentMethod } from '../entities/payment-information.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Payment Information')
@Controller('payment-information')
export class PaymentInformationController {
  constructor(private readonly paymentInfoService: PaymentInformationService) {}

  @Get()
  @ApiOperation({
    summary: 'List Payment Methods',
    description:
      'Returns a list of payment methods optionally filtered by payment method type.',
  })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    description: 'Filter by the payment method type',
    enum: PaymentMethod,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully returned list of payment methods.',
    type: [ResponsePaymentInformationDTO],
  })
  async findAll(
    @Query('paymentMethod') paymentMethod: PaymentMethod,
  ): Promise<ResponsePaymentInformationDTO[]> {
    return this.paymentInfoService.findAll(paymentMethod);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Payment Method',
    description:
      'Creates a new payment method. Accessible only for users with roles ADMIN or BRANCH_ADMIN.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Payment method successfully created.',
    type: ResponsePaymentInformationDTO,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async create(
    @Body() createPaymentInfoDto: CreatePaymentInformationDTO,
  ): Promise<ResponsePaymentInformationDTO> {
    return await this.paymentInfoService.create(createPaymentInfoDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Payment Method Detail',
    description:
      'Retrieves detailed information about a specific payment method using its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the payment method',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully returned the payment method detail.',
    type: ResponsePaymentInformationDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponsePaymentInformationDTO> {
    return this.paymentInfoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Payment Method',
    description:
      'Updates the information of an existing payment method. Accessible only for users with roles ADMIN or BRANCH_ADMIN.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the payment method to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method successfully updated.',
    type: ResponsePaymentInformationDTO,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePaymentInfoDto: UpdatePaymentInformationDTO,
  ): Promise<ResponsePaymentInformationDTO> {
    return await this.paymentInfoService.update(id, updatePaymentInfoDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Payment Method',
    description:
      'Performs a logical deletion of the payment method. Accessible only for users with roles ADMIN or BRANCH_ADMIN.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the payment method to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method successfully deleted (logical deletion).',
    type: Boolean,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.paymentInfoService.remove(id);
  }
}
