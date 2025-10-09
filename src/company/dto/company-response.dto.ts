import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '@prisma/client';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the company',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the company',
    example: 'Tech Solutions LLP',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the company',
    example: 'Leading technology solutions provider',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Individual Identification Number (INN) of the company',
    example: '123456789012',
    nullable: true,
  })
  inn: string | null;

  @ApiProperty({
    description: 'Address of the company',
    example: 'Almaty, Kazakhstan',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Region ID where the company is located',
    example: 1,
    nullable: true,
  })
  regionId: number | null;

  @ApiProperty({
    description: 'Type of the company',
    enum: CompanyType,
    example: CompanyType.PROJECT,
  })
  type: CompanyType;

  @ApiProperty({
    description: 'Date when the company was created',
    example: '2024-08-04T21:05:09.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the company was last updated',
    example: '2024-08-04T21:05:09.000Z',
  })
  updatedAt: Date;
}