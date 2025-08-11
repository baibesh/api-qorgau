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

  @ApiProperty({
    description: 'HEX or any color string',
    example: '#00CC88',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  color?: string | null;

  @ApiProperty({
    description: 'Short description of the column purpose',
    example: 'Items being actively worked on',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;
}
