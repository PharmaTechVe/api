import { ApiProperty } from '@nestjs/swagger';
import { Transform, Exclude } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordDTO {
  @ApiProperty({ description: 'the password of the user' })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MinLength(8)
  @Exclude()
  password: string;
}
