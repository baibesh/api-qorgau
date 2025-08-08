import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectCommentDto {
  @ApiProperty({ description: 'Project ID to attach the comment to' })
  @IsInt()
  projectId: number;

  @ApiProperty({ description: 'Comment message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
