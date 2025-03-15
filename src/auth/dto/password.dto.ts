import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MaxLength, IsNotEmpty, MinLength } from 'class-validator';

export class PasswordDTO {
  @ApiProperty({ description: 'the new password of the user' })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(8)
  password: string;
}
