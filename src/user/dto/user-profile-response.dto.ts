import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'Profile ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID', example: 10 })
  userId: number;

  @ApiPropertyOptional({
    description: 'Company ID linked to the user profile',
    example: 3,
  })
  companyId?: number | null;

  @ApiPropertyOptional({
    description: 'User position in the company',
    example: 'Project Manager',
  })
  position?: string | null;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://cdn.example.com/avatars/u10.png',
  })
  avatar?: string | null;

  @ApiPropertyOptional({
    description: 'Address',
    example: 'Astana, KZ',
  })
  address?: string | null;

  @ApiProperty({ description: 'Created at date ISO string' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date ISO string' })
  updatedAt: Date;
}