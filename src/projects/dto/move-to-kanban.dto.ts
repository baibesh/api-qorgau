import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class MoveToKanbanDto {
  @ApiProperty({
    description: 'Target kanban column ID',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  columnId: number;
}