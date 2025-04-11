import { Body, Controller, Post } from '@nestjs/common';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import {
  CreatePaymentConfirmationDTO,
  ResponsePaymentConfirmationDTO,
} from '../dto/payment-confirmation.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Confirmation')
@Controller('payment-confirmation')
export class PaymentConfirmationController {
  constructor(
    private readonly paymentConfirmationService: PaymentConfirmationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create Payment Confirmation',
    description: 'Registers a new payment confirmation for a user order.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment confirmation created successfully.',
    type: ResponsePaymentConfirmationDTO,
  })
  async create(
    @Body() createPaymentConfirmationDto: CreatePaymentConfirmationDTO,
  ): Promise<ResponsePaymentConfirmationDTO> {
    return this.paymentConfirmationService.create(createPaymentConfirmationDto);
  }
}
