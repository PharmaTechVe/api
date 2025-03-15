import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}
