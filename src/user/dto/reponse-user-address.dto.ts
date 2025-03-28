import { ApiProperty } from '@nestjs/swagger';
import { CreateUserAddressDTO } from './create-user-address.dto';

export class UserAddressDTO extends CreateUserAddressDTO {
  @ApiProperty({
    description: 'The unique identifier of the address',
  })
  id: string;
}
