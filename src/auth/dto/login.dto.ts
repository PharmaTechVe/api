import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { PasswordDTO } from './password.dto';
import { Transform } from 'class-transformer';

export class LoginDTO extends PasswordDTO {
  @ApiProperty()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginResponseDTO {
  @ApiProperty()
  accessToken: string;
}
