import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CountryDTO } from 'src/country/dto/country.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class ManufacturerDTO {
  @ApiProperty({ description: 'The name of the manufacturer' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the manufacturer',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;
}

export class CreateManufacturerDTO extends ManufacturerDTO {
  @ApiProperty({ description: 'The country id of the manufacturer' })
  @IsNotEmpty()
  @IsUUID()
  countryId: string;
}

export class UpdateManufacturerDTO extends PartialType(CreateManufacturerDTO) {}

export class ResponseManufacturerDTO extends IntersectionType(
  ManufacturerDTO,
  BaseDTO,
) {
  @ApiProperty({ description: 'The country of the manufacturer' })
  country: CountryDTO;
}
