import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { CityDTO } from 'src/city/dto/city.dto';

class BranchDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the branch' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The address of the branch' })
  address: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  @ApiProperty({ description: 'The latitude of the branch' })
  latitude: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  @ApiProperty({ description: 'The longitude of the branch' })
  longitude: number;
}

export class CreateBranchDTO extends BranchDTO {
  @IsNotEmpty()
  @ApiProperty({ description: 'The city id of the branch' })
  cityId: string;
}

export class UpdateBranchDTO extends PartialType(CreateBranchDTO) {}

export class ResponseBranchDTO extends BranchDTO {
  @ApiProperty({ description: 'The id of the branch' })
  id: string;

  @ApiProperty({ description: 'The city of the branch' })
  city: CityDTO;
}
