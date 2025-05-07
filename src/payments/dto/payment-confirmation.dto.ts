import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';

class PaymentConfirmationDTO {
  @Expose()
  @ApiProperty()
  @IsString()
  bank: string;

  @Expose()
  @ApiProperty()
  @IsString()
  reference: string;

  @Expose()
  @ApiProperty()
  @IsString()
  documentId: string;

  @Expose()
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
