import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Transform, Expose, TransformFnParams, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from '../entities/profile.entity';
import { IsOlderThan } from 'src/utils/is-older-than-validator';
import { UserRole } from '../entities/user.entity';

class PasswordDTO {
  @ApiProperty({ description: 'La contraseña del usuario' })
  @Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'string' ? value.trim() : '';
  })
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(8)
  password: string;
}

export class BaseUserDTO {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'El email del usuario', uniqueItems: true })
  @Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ description: 'the id of the user', uniqueItems: true })
  @IsNotEmpty()
  @Expose()
  documentId: string;

  @ApiProperty({ description: 'the phone number of the user', required: false })
  @Matches(/^\+?[0-9]*$/, {
    message:
      'phoneNumber must contain only numbers and may start with a "+" sign',
  })
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
  birthDate: Date;

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

export class UserDTO extends IntersectionType(BaseUserDTO, PasswordDTO) {}

export class UserAdminDTO extends BaseUserDTO {
  @ApiProperty({ description: 'the role of the user' })
  @IsNotEmpty()
  @Expose()
  role: UserRole;
}

class ProfileDTO {
  @ApiProperty({ description: 'URL of the profile picture', nullable: true })
  @Expose()
  @IsNotEmpty()
  profilePicture?: string;

  @ApiProperty({
    description: 'birthDate must be a valid date in YYYY-MM-DD format',
  })
  @Expose()
  @IsNotEmpty()
  birthDate: Date;

  @ApiProperty({ description: 'gender of the user' })
  @Expose()
  gender: string;
}

export class UserListDTO extends OmitType(UserDTO, ['birthDate'] as const) {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty({ description: 'User creation date' })
  @IsNotEmpty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'User update date' })
  @IsNotEmpty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'The date when the user was deleted, if applicable',
    nullable: true,
  })
  @Expose()
  deletedAt: Date | null;

  @ApiProperty({
    description: 'Date the user made their last order (if applicable)',
    nullable: true,
  })
  @Expose()
  lastOrderDate: Date | null;

  @ApiProperty({ description: 'User role' })
  @Expose()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'User validation status' })
  @IsNotEmpty()
  @Expose()
  isValidated: boolean;

  @ApiProperty({ description: 'Profile object' })
  @Expose()
  @Type(() => ProfileDTO)
  profile: ProfileDTO;
}

export class UpdateUserDTO extends PartialType(
  OmitType(BaseUserDTO, ['documentId']),
) {
  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({ description: 'Role of the user', enum: UserRole })
  role?: UserRole;

  @IsOptional()
  @ApiProperty({ description: 'Profile picture URL of the user' })
  @IsUrl()
  profilePicture?: string;
}
