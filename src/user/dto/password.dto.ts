import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordDTO {
  @ApiProperty({ description: 'the password of the user' })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
