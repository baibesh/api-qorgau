import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProjectStatusDto {
  @ApiProperty({
    description: 'Name of the project status',
    example: 'In Progress',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the project status',
    example: 'Project is currently in progress',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
