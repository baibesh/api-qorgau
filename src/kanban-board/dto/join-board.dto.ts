import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinBoardDto {
  @ApiProperty({ description: 'Invitation code of the board', example: 'AbCdEfGhIj' })
  @IsString()
  @Length(6, 64)
  code: string;
}
