import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatusResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the project status',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the project status',
    example: 'In Progress',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the project status',
    example: 'Project is currently in progress',
  })
  description: string;
}
