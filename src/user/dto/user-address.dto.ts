import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateUserAddressDTO {
  @ApiProperty({ description: 'Street address or main address information' })
  @IsNotEmpty()
  @IsString()
  adress: string;

  @ApiProperty({ description: 'Zip or postal code', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'Latitude of the address', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude of the address', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'ID of the city where the address is located' })
  @IsNotEmpty()
  @IsString()
  cityId: string;
}

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
