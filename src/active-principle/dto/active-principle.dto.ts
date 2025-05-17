import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ResponseActivePrincipleDTO {
  @Expose()
  @ApiProperty({ example: 'Acetaminophen' })
  @IsString()
  name: string;
}
