import { ApiProperty } from '@nestjs/swagger';

export class PermissionInfoDto {
  @ApiProperty({
    description: 'Unique identifier of the permission',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the permission',
    example: 'CREATE_USER',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the permission',
    example: 'Allows creating new users',
    required: false,
  })
  description?: string;
}

export class UserInfoDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  email: string;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the role',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the role',
    example: 'ADMIN',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator role with full access',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID of the user who created this role',
    example: 1,
    required: false,
  })
  createdBy?: number;

  @ApiProperty({
    description: 'List of permissions assigned to this role',
    type: [PermissionInfoDto],
    example: [
      {
        id: 1,
        name: 'CREATE_USER',
        description: 'Allows creating new users',
      },
    ],
  })
  permissions: PermissionInfoDto[];

  @ApiProperty({
    description: 'List of users assigned to this role',
    type: [UserInfoDto],
    example: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    ],
  })
  users: UserInfoDto[];
}