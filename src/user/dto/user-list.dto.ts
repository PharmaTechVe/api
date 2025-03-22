import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserDTO } from './user.dto';
import { Type, Expose } from 'class-transformer';
import { ProfileDTO } from './profile.dto';

export class UserListDTO extends UserDTO {
  @ApiProperty({ description: 'User creation date' })
  @IsNotEmpty()
  @Expose()
  createdAt: string;

  @ApiProperty({ description: 'User update date' })
  @IsNotEmpty()
  @Expose()
  updatedAt: string;

  @ApiProperty({
    description: 'The date when the user was deleted, if applicable',
    nullable: true,
  })
  @Expose()
  deletedAt: string | null;

  @ApiProperty({
    description: 'Date the user made their last order (if applicable)',
    nullable: true,
  })
  @Expose()
  lastOrderDate: string | null;

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
