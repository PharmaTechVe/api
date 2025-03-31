import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { UserGender } from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOlderThan } from 'src/utils/is-older-than-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'First name of the user' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Last name of the user' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Email address of the user' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Profile picture URL of the user' })
  @IsUrl()
  profilePicture?: string;

  @ApiProperty({ description: 'the birth date of the user' })
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value).toISOString().split('T')[0],
  )
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'birthDate must be a valid date in YYYY-MM-DD format' },
  )
  @IsOlderThan(14)
  birthDate: string;

  @IsOptional()
  @IsEnum(UserGender)
  @ApiProperty({ description: 'Gender of the user', enum: UserGender })
  gender?: UserGender;
}
