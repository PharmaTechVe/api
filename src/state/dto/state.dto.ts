import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CountryResponseDTO } from 'src/country/dto/country.dto';
import { UUIDBaseDTO } from 'src/utils/dto/base.dto';

export class CreateStateDTO {
  @ApiProperty({ description: 'The name of the state' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The UUID of the associated country' })
  @IsNotEmpty()
  @IsUUID()
  countryId: string;
}

export class UpdateStateDTO extends PartialType(CreateStateDTO) {}

export class StateDTO extends UUIDBaseDTO {
  @ApiProperty({ description: 'The name of the state' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The country associated with the state' })
  country: CountryResponseDTO;
}
