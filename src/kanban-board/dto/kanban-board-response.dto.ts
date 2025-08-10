import { ApiProperty } from '@nestjs/swagger';

export class KanbanColumnBriefDto {
  @ApiProperty({ description: 'Column ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Column name', example: 'To Do' })
  name: string;

  @ApiProperty({ description: 'Column position', example: 1 })
  position: number;
}

export class KanbanBoardResponseDto {
  @ApiProperty({ description: 'Board ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Board name', example: 'Default Board' })
  name: string;

  @ApiProperty({
    description: 'Board description',
    example: 'Board for tracking sales pipeline',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-08-07T05:56:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Columns on this board',
    type: [KanbanColumnBriefDto],
  })
  columns: KanbanColumnBriefDto[];
}
