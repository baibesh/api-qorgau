import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class ColumnOrderDto {
  @ApiProperty({ description: 'Kanban column ID', example: 1 })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ description: 'New position for the column', example: 2 })
  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderKanbanColumnsDto {
  @ApiProperty({ type: [ColumnOrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderDto)
  items: ColumnOrderDto[];
}
