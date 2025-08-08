import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateKanbanBoardDto {
  @ApiProperty({ description: 'Kanban board name', example: 'Default Board' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
