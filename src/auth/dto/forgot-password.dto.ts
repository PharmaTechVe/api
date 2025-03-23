import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDTO {
  @ApiProperty()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsEmail()
  email: string;
}
