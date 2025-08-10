import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'User ID to add as member', example: 5 })
  @IsInt()
  @Min(1)
  userId: number;
}
