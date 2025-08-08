import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateKanbanColumnDto {
  @ApiProperty({ description: 'Board ID to attach the column to', example: 1 })
  @IsInt()
  @Min(1)
  boardId: number;

  @ApiProperty({ description: 'Column name', example: 'To Do' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description:
      'Column position (optional). If omitted, will be set to the next position.',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
