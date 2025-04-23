import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { Expose } from 'class-transformer';

export class CreatePresentationDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the presentation' })
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The description of the presentation' })
  description: string;

  @Expose()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({ description: 'The quantity of the presentation' })
  quantity: number;

  @Expose()
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
