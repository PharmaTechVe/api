import { IsDate, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserGender } from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Date of birth of the user' })
  birthDate?: Date;

  @IsOptional()
  @IsEnum(UserGender)
  @ApiProperty({ description: 'Gender of the user', enum: UserGender })
  gender?: UserGender;
}
