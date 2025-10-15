import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  soundVolume?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectCreated?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectUpdated?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectAssigned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectComment?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  userMentioned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  fileUploaded?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  deadlineApproaching?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  statusChanged?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  systemAnnouncement?: boolean;
}
