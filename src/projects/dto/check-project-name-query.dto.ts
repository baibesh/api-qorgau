import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckProjectNameQueryDto {
  @ApiProperty({
    description: 'Project name to check for uniqueness',
    example: 'New Infrastructure Project',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
