import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { StateDTO } from 'src/state/dto/state.dto';
import { UUIDBaseDTO } from 'src/utils/dto/base.dto';

export class CreateCityDTO {
  @ApiProperty({ description: 'The name of the city' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The UUID of the associated state' })
  @IsNotEmpty()
  @IsUUID()
  stateId: string;
}

export class UpdateCityDTO extends PartialType(CreateCityDTO) {}

export class CityDTO extends UUIDBaseDTO {
  @ApiProperty({ description: 'The name of the city' })
  name: string;

  @ApiProperty({ description: 'The state associated with the city' })
  state: StateDTO;
}
