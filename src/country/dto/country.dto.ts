import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CountryDTO {
  @ApiProperty({ description: 'The name of the country' })
  @IsNotEmpty()
  name: string;
}

export class CountryResponseDTO extends CountryDTO {
  @ApiProperty({ description: 'The id of the country' })
  id: string;
}

export class UpdateCountryDTO extends PartialType(CountryDTO) {}
