import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDTO {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email of the user', uniqueItems: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'the password of the user' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'the id of the user', uniqueItems: true })
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'the phone number of the user' })
  @IsNotEmpty()
  @MinLength(13)
  phoneNumber: string;
}
