import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CategoryDTO {
  @Expose()
  @ApiProperty({ description: 'The name of the category' })
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({ description: 'The description of the category' })
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}

export class CategoryResponseDTO extends CategoryDTO {
  @Expose()
  @ApiProperty({ description: 'The id of the category' })
  id: string;
}

export class UpdateCategoryDTO extends PartialType(CategoryDTO) {}
