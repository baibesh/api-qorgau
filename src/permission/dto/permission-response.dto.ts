import { ApiProperty } from '@nestjs/swagger';

export class RoleInfoDto {
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
}

export class PermissionResponseDto {
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

  @ApiProperty({
    description: 'List of roles that have this permission',
    type: [RoleInfoDto],
    example: [
      {
        id: 1,
        name: 'ADMIN',
        description: 'Administrator role with full access',
      },
    ],
  })
  roles: RoleInfoDto[];
}