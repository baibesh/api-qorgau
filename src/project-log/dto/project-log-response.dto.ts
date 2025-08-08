import { ApiProperty } from '@nestjs/swagger';

class ProjectLogUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ name: 'full_name' })
  full_name: string;
}

export class ProjectLogResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  changedBy: number;

  @ApiProperty()
  field: string;

  @ApiProperty({ required: false, nullable: true })
  oldValue?: string | null;

  @ApiProperty({ required: false, nullable: true })
  newValue?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => ProjectLogUserDto })
  user: ProjectLogUserDto;
}
