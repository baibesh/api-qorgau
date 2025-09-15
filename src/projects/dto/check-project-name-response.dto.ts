import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class SimilarProjectDto {
  @ApiProperty({ description: 'Project ID', example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ description: 'Project name', example: 'New Infrastructure Project' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Project code', example: 'INFRA-2024-001', required: false })
  @IsString()
  @IsOptional()
  code?: string | null;
}

export class CheckProjectNameResponseDto {
  @ApiProperty({ description: 'Whether the provided name is unique (no exact match exists).', example: true })
  @IsBoolean()
  isUnique!: boolean;

  @ApiProperty({ type: [SimilarProjectDto], description: 'List of projects with similar names (case-insensitive substring match).', example: [] })
  @IsArray()
  similar!: SimilarProjectDto[];
}
