import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';

class PaymentConfirmationDTO {
  @ApiProperty()
  @IsString()
  bank: string;

  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  documentId: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}

export class CreatePaymentConfirmationDTO extends PaymentConfirmationDTO {
  @ApiProperty()
  @IsString()
  @IsUUID()
  orderId: string;
}

export class ResponsePaymentConfirmationDTO extends IntersectionType(
  PaymentConfirmationDTO,
  BaseDTO,
) {}
