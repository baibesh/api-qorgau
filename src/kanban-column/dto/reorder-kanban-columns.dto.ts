import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';

export class ColumnOrderDto {
  @ApiProperty({ description: 'Kanban column ID', example: 1 })
  @Min(1)
  id: number;

  @ApiProperty({ description: 'New position for the column', example: 2 })
  @Min(0)
  position: number;
}
