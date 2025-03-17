import { ApiProperty } from '@nestjs/swagger';

export class ProfileDTO {
  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'URL of the profile picture', nullable: true })
  profilePicture?: string;
}
