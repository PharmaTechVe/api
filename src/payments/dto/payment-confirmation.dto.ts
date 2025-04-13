import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class CreatePaymentConfirmationDTO {
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

export class ResponsePaymentConfirmationDTO extends IntersectionType(
  CreatePaymentConfirmationDTO,
  BaseDTO,
) {}
