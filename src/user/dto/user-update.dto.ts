import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  firstName: string;

  lastName: string;

  phoneNumber: string;
}
