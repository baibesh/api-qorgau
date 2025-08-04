import { ApiProperty } from '@nestjs/swagger';

export class ProjectTypeResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the project type',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the project type',
    example: 'Infrastructure',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the project type',
    example: 'Infrastructure development projects',
  })
  description: string;
}