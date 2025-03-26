import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateUserAddressDTO {
  @ApiProperty({
    description: 'The unique identifier of the address',
    required: false,
  })
  @IsOptional()
  id?: string;

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
