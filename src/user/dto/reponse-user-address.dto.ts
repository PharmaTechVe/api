import { ApiProperty } from '@nestjs/swagger';
import { CreateUserAddressDTO } from './create-user-address.dto';

export class UserAddressDTO extends CreateUserAddressDTO {
  @ApiProperty({
    description: 'The unique identifier of the address',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the city of the address',
  })
  nameCity: string;

  @ApiProperty({
    description: 'The name of the state of the address',
  })
  nameState: string;

  @ApiProperty({
    description: 'The name of the country of the address',
  })
  nameCountry: string;
}
