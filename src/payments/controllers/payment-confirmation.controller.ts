import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import {
  CreatePaymentConfirmationDTO,
  ResponsePaymentConfirmationDTO,
} from '../dto/payment-confirmation.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';

@ApiTags('Payment Confirmation')
@Controller('payment-confirmation')
export class PaymentConfirmationController {
  constructor(
    private readonly paymentConfirmationService: PaymentConfirmationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
    @Req() req: CustomRequest,
    @Body() createPaymentConfirmationDto: CreatePaymentConfirmationDTO,
  ): Promise<ResponsePaymentConfirmationDTO> {
    return this.paymentConfirmationService.create(
      req.user.id,
      createPaymentConfirmationDto,
    );
  }
}
