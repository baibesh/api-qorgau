import { ApiProperty } from '@nestjs/swagger';

export class RegionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the region',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the region',
    example: 'Almaty',
  })
  name: string;
}