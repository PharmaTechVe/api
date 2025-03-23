import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class CreatePresentationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the presentation' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The description of the presentation' })
  description: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'The quantity of the presentation' })
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The measurement unit of the presentation (mg, ml, pills)',
  })
  measurementUnit: string;
}

export class UpdatePresentationDTO extends PartialType(CreatePresentationDTO) {}

export class ResponsePresentationDTO extends IntersectionType(
  CreatePresentationDTO,
  BaseDTO,
) {}
