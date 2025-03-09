import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateEmailDto {
  @ApiProperty({ example: '123456', description: 'Código OTP de 6 dígitos' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  code: string;
}
