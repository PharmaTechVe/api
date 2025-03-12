import { ApiProperty } from '@nestjs/swagger';

export class UserListDTO {
  @ApiProperty({ example: '782342ab-607e-4a8a-beec-55fe271b5842' })
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ nullable: true })
  deletedAt: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isValidated: boolean;

  @ApiProperty({ nullable: true })
  lastOrderDate: string | null;

  @ApiProperty()
  role: string;
}
