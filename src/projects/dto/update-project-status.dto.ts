import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'New project status ID',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  statusId: number;
}