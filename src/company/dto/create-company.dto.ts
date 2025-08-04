import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Name of the company',
    example: 'Tech Solutions LLP',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the company',
    example: 'Leading technology solutions provider',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Individual Identification Number (INN) of the company',
    example: '123456789012',
    required: false,
  })
  @IsString()
  @IsOptional()
  inn?: string;

  @ApiProperty({
    description: 'Address of the company',
    example: 'Almaty, Kazakhstan',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Region ID where the company is located',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  regionId?: number;
}