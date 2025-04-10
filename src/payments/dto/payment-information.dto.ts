import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment-information.entity';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePaymentInformationDTO {
  @ApiProperty()
  @IsString()
  bank: string;

  @ApiProperty()
  @IsString()
  accountType: 'saving' | 'checking';

  @ApiProperty()
  @IsString()
  account: string;

  @ApiProperty()
  @IsString()
  documentId: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class UpdatePaymentInformationDto extends PartialType(
  CreatePaymentInformationDTO,
) {}
