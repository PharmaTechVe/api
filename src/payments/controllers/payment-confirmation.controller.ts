import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import {
  CreatePaymentConfirmationDTO,
  ResponsePaymentConfirmationDTO,
} from '../dto/payment-confirmation.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - The order does not belong to the authenticated user.',
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
