import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CategoryDTO {
  @ApiProperty({ description: 'The name of the category' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the category' })
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}

export class CategoryResponseDTO extends CategoryDTO {
  @ApiProperty({ description: 'The id of the category' })
  id: string;
}

export class UpdateCategoryDTO extends PartialType(CategoryDTO) {}
