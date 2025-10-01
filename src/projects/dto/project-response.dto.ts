import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Project name',
    example: 'New Infrastructure Project',
  })
  name: string;

  @ApiProperty({
    description: 'Project code',
    example: 'INFRA-2024-001',
    nullable: true,
  })
  code: string | null;

  @ApiProperty({
    description: 'Region ID',
    example: 1,
  })
  regionId: number;

  @ApiProperty({
    description: 'Region information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Almaty' },
    },
  })
  region: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'Project status ID',
    example: 1,
  })
  statusId: number;

  @ApiProperty({
    description: 'Project status information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'In Progress' },
      description: { type: 'string', example: 'Project is in progress' },
    },
  })
  status: {
    id: number;
    name: string;
    description: string;
  };

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
  })
  contactName: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+7 777 123 4567',
    nullable: true,
  })
  contactPhone: string | null;

  @ApiProperty({
    description: 'Contact email address',
    example: 'john.doe@example.com',
    nullable: true,
  })
  contactEmail: string | null;

  @ApiProperty({
    description: 'Company ID',
    example: 1,
    nullable: true,
  })
  companyId: number | null;

  @ApiProperty({
    description: 'Company information',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Tech Corp' },
      description: {
        type: 'string',
        example: 'Technology company',
        nullable: true,
      },
    },
  })
  company: {
    id: number;
    name: string;
    description: string | null;
  } | null;

  @ApiProperty({
    description: 'Executors information',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'executor@example.com' },
        full_name: { type: 'string', example: 'Jane Smith' },
      },
    },
  })
  executors: Array<{
    id: number;
    email: string;
    full_name: string;
  }>;

  @ApiProperty({
    description: 'Creator user ID',
    example: 1,
  })
  createdBy: number;

  @ApiProperty({
    description: 'Creator information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'creator@example.com' },
      full_name: { type: 'string', example: 'Admin User' },
      avatar: {
        type: 'string',
        example: 'storage/avatars/abc123.jpg',
        nullable: true,
      },
    },
  })
  creator: {
    id: number;
    email: string;
    full_name: string;
    avatar?: string | null;
  };

  @ApiProperty({
    description: 'Kanban column ID',
    example: 1,
  })
  kanbanColumnId: number;

  @ApiProperty({
    description: 'Kanban column information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'To Do' },
      position: { type: 'number', example: 1 },
    },
  })
  kanbanColumn: {
    id: number;
    name: string;
    position: number;
  };

  @ApiProperty({
    description: 'Attached files as JSON',
    example: '[]',
  })
  attachedFiles: any;

  @ApiProperty({
    description: 'Expected deadline',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true,
  })
  expectedDeadline: Date | null;

  @ApiProperty({
    description: 'Project comments',
    example: 'Initial project setup',
    nullable: true,
  })
  comments: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-08-07T05:56:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-08-07T05:56:00.000Z',
  })
  updatedAt: Date;
}
