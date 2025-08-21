import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from '../../projects/dto/project-response.dto';

export class ColumnWithProjectsDto {
  @ApiProperty({ description: 'Kanban column ID', example: 21 })
  columnId: number;

  @ApiProperty({ description: 'Column name', example: 'Backlog' })
  name: string;

  @ApiProperty({ type: [ProjectResponseDto] })
  projects: ProjectResponseDto[];
}

export class KanbanBoardProjectsResponseDto {
  @ApiProperty({ description: 'Kanban board ID', example: 7 })
  boardId: number;

  @ApiProperty({ type: [ColumnWithProjectsDto] })
  columns: ColumnWithProjectsDto[];
}
