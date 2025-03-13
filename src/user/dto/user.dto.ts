import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDTO {
  @ApiProperty({ description: 'The name of the user' })
  @Expose()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @Expose()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email of the user', uniqueItems: true })
  @Transform(({ value }: { value: string }) => value.trim())
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'the id of the user', uniqueItems: true })
  @Expose()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'the phone number of the user' })
  @Expose()
  @IsNotEmpty()
  phoneNumber: string;
}
