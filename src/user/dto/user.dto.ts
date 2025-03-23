import { ApiProperty } from '@nestjs/swagger';
import { Transform, Expose } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserGender } from '../entities/profile.entity';
import { IsOlderThan } from 'src/utils/is-older-than-validator';

export class UserDTO {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'The email of the user', uniqueItems: true })
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ description: 'the password of the user' })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'the id of the user', uniqueItems: true })
  @IsNotEmpty()
  @Expose()
  documentId: string;

  @ApiProperty({ description: 'the phone number of the user', required: false })
  @IsOptional()
  @Expose()
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
  @IsOlderThan(14)
  birthDate: string;

  @ApiProperty({
    description: 'the gender of the user',
    required: false,
    enum: UserGender,
  })
  @Expose()
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
