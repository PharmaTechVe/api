import { OmitType, ApiProperty } from '@nestjs/swagger';
import { UserDTO } from './user.dto';
import { Expose } from 'class-transformer';

export class ProfileDTO extends OmitType(UserDTO, [
  'password',
  'birthDate',
] as const) {
  @ApiProperty({
    description: 'birthDate must be a valid date in YYYY-MM-DD format',
  })
  @Expose()
  birthDate: Date;

  @ApiProperty({ description: 'URL of the profile picture', nullable: true })
  @Expose()
  profilePicture?: string;

  @ApiProperty({ description: 'rol of the user' })
  role: string;
}
