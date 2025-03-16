import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpDTO {
  @ApiProperty({
    description:
      'One Time Password for email verification and password recovery',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}
