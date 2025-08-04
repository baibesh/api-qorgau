import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProjectTypeDto {
  @ApiProperty({
    description: 'Name of the project type',
    example: 'Infrastructure',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the project type',
    example: 'Infrastructure development projects',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
