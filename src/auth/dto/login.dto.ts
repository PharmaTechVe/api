import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { PasswordDTO } from './password.dto';

export class LoginDTO extends PasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginResponseDTO {
  @ApiProperty()
  accessToken: string;
}
