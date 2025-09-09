import { ApiProperty } from '@nestjs/swagger';

export class PermissionsResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'List of permission names granted to the user (via roles)',
    example: ['projects.read', 'projects.write'],
  })
  permissions: string[];
}
