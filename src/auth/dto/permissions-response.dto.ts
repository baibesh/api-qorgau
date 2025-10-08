import { ApiProperty } from '@nestjs/swagger';

export enum Scope {
  GLOBAL = 'GLOBAL',
  COMPANY = 'COMPANY',
}

export class PermissionsResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Company ID if user is associated with a company',
    example: 2,
    nullable: true,
  })
  companyId: number | null;

  @ApiProperty({
    description: 'User scope - GLOBAL for system users, COMPANY for company users',
    enum: Scope,
    example: Scope.COMPANY,
  })
  scope: Scope;

  @ApiProperty({
    description: 'List of role names assigned to the user',
    example: ['COMPANY_ADMIN', 'COMPANY_USER'],
  })
  roles: string[];

  @ApiProperty({
    description: 'List of permission names granted to the user (via roles)',
    example: [
      'company-users:list',
      'company-projects:create',
      'self-profile:update',
    ],
  })
  permissions: string[];

  @ApiProperty({
    description:
      'ACL version for cache invalidation (incremented on role/permission changes)',
    example: 1,
  })
  aclVersion: number;
}
