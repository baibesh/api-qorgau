import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectFilterDto {
  @ApiProperty({
    description: 'Filter by region ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  regionId?: number;

  @ApiProperty({
    description: 'Filter by project status ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusId?: number;


  @ApiProperty({
    description: 'Filter by executor user ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  executorId?: number;

  @ApiProperty({
    description: 'Filter by company ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;
}