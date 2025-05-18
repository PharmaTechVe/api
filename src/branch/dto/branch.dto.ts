import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { CityDTO } from 'src/city/dto/city.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';

class BranchDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the branch' })
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The address of the branch' })
  address: string;

  @Expose()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  @ApiProperty({ description: 'The latitude of the branch' })
  latitude: number;

  @Expose()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  @ApiProperty({ description: 'The longitude of the branch' })
  longitude: number;
}

export class CreateBranchDTO extends BranchDTO {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'The city id of the branch' })
  cityId: string;
}

export class UpdateBranchDTO extends PartialType(CreateBranchDTO) {}

export class ResponseBranchDTO extends IntersectionType(BranchDTO, BaseDTO) {
  @Expose()
  @ApiProperty({ description: 'The city of the branch' })
  city: CityDTO;
}
