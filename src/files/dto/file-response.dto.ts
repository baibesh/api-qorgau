import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class FileResponseDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 34567 })
  @IsInt()
  size: number;

  @ApiProperty({ example: '/api/files/123/download' })
  @IsString()
  url: string;
}
