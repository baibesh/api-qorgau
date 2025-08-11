import { ApiProperty } from '@nestjs/swagger';

export class KanbanColumnResponseDto {
  @ApiProperty({ description: 'Column ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Board ID', example: 1 })
  boardId: number;

  @ApiProperty({ description: 'Column name', example: 'To Do' })
  name: string;

  @ApiProperty({ description: 'Column position', example: 1 })
  position: number;

  @ApiProperty({
    description: 'HEX or any color string',
    example: '#FF9900',
    required: false,
  })
  color?: string | null;

  @ApiProperty({
    description: 'Short description of the column purpose',
    example: 'Tasks to be picked up',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-08-07T05:56:00.000Z',
  })
  createdAt: Date;
}
