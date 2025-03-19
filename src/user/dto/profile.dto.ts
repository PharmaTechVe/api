import { OmitType, ApiProperty } from '@nestjs/swagger';
import { UserDTO } from './user.dto';

export class ProfileDTO extends OmitType(UserDTO, [
  'password',
  'birthDate',
] as const) {
  @ApiProperty({
    description: 'birthDate must be a valid date in YYYY-MM-DD format',
  })
  birthDate: Date;

  @ApiProperty({ description: 'URL of the profile picture', nullable: true })
  profilePicture?: string;

  @ApiProperty({ description: 'rol of the user' })
  role: string;
}
