import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEmail,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'New Infrastructure Project',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Project code',
    example: 'INFRA-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;


  @ApiProperty({
    description: 'Region ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  regionId: number;

  @ApiProperty({
    description: 'Project status ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  statusId: number;

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+7 777 123 4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Company ID',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiProperty({
    description: 'Executor user IDs',
    example: [1, 2],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  executorIds?: number[];

  @ApiProperty({
    description: 'Kanban column ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  kanbanColumnId: number;

  @ApiProperty({
    description: 'Attached file IDs - can be array of numbers or array of objects with id property',
    example: [1, 2, 3],
    required: false,
    type: 'array',
    items: {
      oneOf: [
        { type: 'number', example: 1 },
        { type: 'object', properties: { id: { type: 'number', example: 1 } } }
      ]
    }
  })
  @IsOptional()
  @IsArray()
  attachedFiles?: Array<number | { id: number }>;

  @ApiProperty({
    description: 'Expected deadline',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expectedDeadline?: string;

  @ApiProperty({
    description: 'Project comments',
    example: 'Initial project setup',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;
}
