import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ nullable: true })
  entityType: string | null;

  @ApiProperty({ nullable: true })
  entityId: number | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ nullable: true })
  createdBy: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  readAt: Date | null;
}
