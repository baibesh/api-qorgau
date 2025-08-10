import { ApiProperty } from '@nestjs/swagger';

export class KanbanBoardMemberResponseDto {
  @ApiProperty({ description: 'User ID', example: 3 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  full_name: string;
}
