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
  IsString,
  IsUUID,
  IsBoolean,
  ArrayNotEmpty,
} from 'class-validator';
import { UserGender } from '../entities/profile.entity';
import { IsOlderThan } from 'src/utils/is-older-than-validator';
import { UserRole } from '../entities/user.entity';
import { ResponseBranchDTO } from 'src/branch/dto/branch.dto';

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

  @IsOptional()
  @IsBoolean()
  @Expose()
  @ApiProperty({
    description: 'Indicates whether the user has a generic password',
  })
  isGenericPassword?: boolean;
}

export class UserDTO extends IntersectionType(BaseUserDTO, PasswordDTO) {}

export class UserListUpdateDTO {
  @ApiProperty({
    description: 'List of user IDs to be updated',
    type: [String],
  })
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  users: string[];

  @Expose()
  @IsOptional()
  @ApiProperty({ description: 'If the user has validated the email' })
  isValidated: boolean;

  @Expose()
  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({ description: 'Role of the user', enum: UserRole })
  role: UserRole;
}

export class UserAdminDTO extends BaseUserDTO {
  @ApiProperty({ description: 'the role of the user' })
  @IsNotEmpty()
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: 'branchId of the user (branch_admin or delivery)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @Expose()
  branchId?: string;

  // Data use if it is a delivery

  @ApiProperty({ description: 'Motorcycle brand', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @ApiProperty({ description: 'Motorcycle model', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @ApiProperty({ description: 'Motorcycle color', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  color?: string;

  @ApiProperty({ description: 'Motorcycle plate', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  plate?: string;

  @ApiProperty({
    description: 'URL of the motorcycle license',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  licenseUrl?: string;
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

export class UserMotoDTO {
  @ApiProperty({ description: 'Motorcycle brand', nullable: true })
  @Expose()
  brand?: string;

  @ApiProperty({ description: 'Motorcycle model', nullable: true })
  @Expose()
  model?: string;

  @ApiProperty({ description: 'Motorcycle color', nullable: true })
  @Expose()
  color?: string;

  @ApiProperty({ description: 'Motorcycle plate', nullable: true })
  @Expose()
  plate?: string;

  @ApiProperty({ description: 'URL of motorcycle license', nullable: true })
  @Expose()
  licenseUrl?: string;
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

  @Expose()
  @ApiProperty({
    description: 'If the user has downloades and login in the mobile app',
  })
  @IsOptional()
  isMobileCustomer: boolean;

  @ApiProperty({ description: 'Profile object' })
  @Expose()
  @Type(() => ProfileDTO)
  profile: ProfileDTO;

  @ApiProperty({ description: 'userMoto object' })
  @Expose()
  @Type(() => UserMotoDTO)
  userMoto: UserMotoDTO;

  @Expose()
  @ApiProperty({
    description: 'Branch object',
    type: ResponseBranchDTO,
    nullable: true,
  })
  @Type(() => ResponseBranchDTO)
  branch?: ResponseBranchDTO;
}

export class UpdateUserDTO extends PartialType(
  OmitType(BaseUserDTO, ['documentId', 'email']),
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
