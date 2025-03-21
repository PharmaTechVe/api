import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserGender } from '../entities/profile.entity';

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

  @ApiProperty({ description: 'the phone number of the user', required: false })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'the birth date of the user' })
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value).toISOString().split('T')[0],
  )
  @IsNotEmpty()
  @IsDateString(
    { strict: true },
    { message: 'birthDate must be a valid date in YYYY-MM-DD format' },
  )
  birthDate: string;

  @ApiProperty({
    description: 'the gender of the user',
    required: false,
    enum: UserGender,
  })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
