import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'Is user admin',
    example: false,
  })
  isAdmin: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful',
  })
  message: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Tokens refreshed successfully',
  })
  message: string;
}