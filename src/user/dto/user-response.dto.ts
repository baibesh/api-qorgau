import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UserRoleResponseDto {
  @ApiProperty({ description: 'Role ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Role name', example: 'Admin' })
  name: string;

  @ApiProperty({ description: 'Role description', example: 'Administrator role', required: false })
  description?: string;
}

export class RegionResponseDto {
  @ApiProperty({ description: 'Region ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Region name', example: 'Almaty' })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User phone', example: '+77771234567', required: false })
  phone?: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  full_name: string;

  @ApiProperty({ description: 'Is user admin', example: false })
  isAdmin: boolean;

  @ApiProperty({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ description: 'Registration date', example: '2023-01-01T00:00:00.000Z' })
  registered_at: Date;

  @ApiProperty({ description: 'Last login date', example: '2023-01-01T00:00:00.000Z', required: false })
  last_login?: Date;

  @ApiProperty({ description: 'User region', type: RegionResponseDto, required: false })
  region?: RegionResponseDto;

  @ApiProperty({ description: 'User roles', type: [UserRoleResponseDto] })
  roles: UserRoleResponseDto[];

  @ApiProperty({ description: 'Last updated date', example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}