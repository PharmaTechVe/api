import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserGender } from '../entities/profile.entity';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
