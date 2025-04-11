import { Body, Controller, Post } from '@nestjs/common';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import { CreatePaymentConfirmationDTO } from '../dto/payment-confirmation.dto';

@Controller('payment-confirmation')
export class PaymentConfirmationController {
  constructor(
    private readonly paymentConfirmationService: PaymentConfirmationService,
  ) {}

  @Post()
  async create(
    @Body() createPaymentConfirmationDto: CreatePaymentConfirmationDTO,
  ) {
    return this.paymentConfirmationService.create(createPaymentConfirmationDto);
  }
}
