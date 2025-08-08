import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateKanbanColumnDto {
  @ApiProperty({
    description: 'New name for the column',
    example: 'In Progress',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'New position for the column',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
