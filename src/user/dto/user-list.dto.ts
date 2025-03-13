import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserDTO } from './user.dto';
import { Expose } from 'class-transformer';

export class UserListDTO extends UserDTO {
  @ApiProperty({ description: 'User creation date' })
  @Expose()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({ description: 'User update date' })
  @Expose()
  @IsNotEmpty()
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
  role: string;

  @ApiProperty({ description: 'User validation status' })
  @Expose()
  @IsNotEmpty()
  isValidated: boolean;
}
