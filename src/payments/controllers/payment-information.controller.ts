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

@Controller('payment-information')
export class PaymentInformationController {
  constructor(private readonly paymentInfoService: PaymentInformationService) {}

  @Get()
  async findAll(
    @Query('paymentMethod') paymentMethod: PaymentMethod,
  ): Promise<ResponsePaymentInformationDTO[]> {
    return this.paymentInfoService.findAll(paymentMethod);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async create(
    @Body() createPaymentInfoDto: CreatePaymentInformationDTO,
  ): Promise<ResponsePaymentInformationDTO> {
    return this.paymentInfoService.create(createPaymentInfoDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponsePaymentInformationDTO> {
    return this.paymentInfoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePaymentInfoDto: UpdatePaymentInformationDTO,
  ): Promise<ResponsePaymentInformationDTO> {
    return await this.paymentInfoService.update(id, updatePaymentInfoDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.paymentInfoService.remove(id);
  }
}
