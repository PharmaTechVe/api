import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserDTO } from './user.dto';
import { Type, Expose } from 'class-transformer';

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
  @Expose()
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
