import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { UserGender } from '../entities/profile.entity';

export class ProfileDTO {
  @ApiProperty({ description: 'Profile picture URL' })
  @Expose()
  profilePicture: string;

  @ApiProperty({ description: 'the birth date of the user' })
  @Expose()
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

  @ApiProperty({ description: 'the gender of the user' })
  @Expose()
  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender;
}
