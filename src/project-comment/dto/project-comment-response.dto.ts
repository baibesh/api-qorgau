import { ApiProperty } from '@nestjs/swagger';

class ProjectCommentAuthorDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ name: 'full_name' })
  full_name: string;
}

export class ProjectCommentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  authorId: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => ProjectCommentAuthorDto })
  author: ProjectCommentAuthorDto;
}
