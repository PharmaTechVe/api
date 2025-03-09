import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserDTO {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email of the user', uniqueItems: true })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'the password of the user' })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'the id of the user', uniqueItems: true })
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'the phone number of the user' })
  @IsNotEmpty()
  phoneNumber: string;
}
