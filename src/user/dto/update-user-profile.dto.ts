import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Company ID to link with user profile',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({
    description: 'User position in the company',
    example: 'Project Manager',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://cdn.example.com/avatars/u10.png',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: 'Astana, KZ',
  })
  @IsOptional()
  @IsString()
  address?: string;
}