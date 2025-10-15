import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Observable, interval, map, filter } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { NotificationGatewayService } from './notification-gateway.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationGatewayService,
  ) {}

  @Sse('stream')
  notificationStream(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.userId;

    // Heartbeat для поддержания соединения
    const heartbeat$ = interval(30000).pipe(
      map(() => ({
        type: 'heartbeat',
        data: { timestamp: new Date().toISOString() },
      })),
    );

    // Поток уведомлений для конкретного пользователя
    const notifications$ = this.notificationGateway.getGlobalStream().pipe(
      filter((event) => event.userId === userId),
      map((event) => ({
        type: 'notification',
        data: event.notification,
      })),
    );

    // Объединяем heartbeat и уведомления
    return new Observable<MessageEvent>((observer) => {
      const heartbeatSub = heartbeat$.subscribe((event) => observer.next(event));
      const notificationsSub = notifications$.subscribe((event) =>
        observer.next(event),
      );

      return () => {
        heartbeatSub.unsubscribe();
        notificationsSub.unsubscribe();
      };
    });
  }

  @Get()
  @ApiOkResponse({ type: [NotificationResponseDto] })
  async getNotifications(
    @Req() req: any,
    @Query() filter: NotificationFilterDto,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.getForUser(userId, filter);
  }

  @Get('unread-count')
  @ApiOkResponse({ type: Number })
  async getUnreadCount(@Req() req: any): Promise<{ count: number }> {
    const userId = req.user.userId;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get('settings')
  @ApiOkResponse()
  async getSettings(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getSettings(userId);
  }

  @Patch('settings')
  @ApiOkResponse()
  async updateSettings(
    @Req() req: any,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.updateSettings(userId, dto);
  }

  @Get(':id')
  @ApiOkResponse({ type: NotificationResponseDto })
  async getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getOne(id, userId);
  }

  @Patch(':id/read')
  @ApiOkResponse({ type: NotificationResponseDto })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOkResponse()
  async markAllAsRead(@Req() req: any): Promise<{ count: number }> {
    const userId = req.user.userId;
    const count = await this.notificationsService.markAllAsRead(userId);
    return { count };
  }

  @Delete(':id')
  @ApiOkResponse()
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    const userId = req.user.userId;
    await this.notificationsService.delete(id, userId);
    return { success: true };
  }

  @Delete('clear-all')
  @ApiOkResponse()
  async clearAll(@Req() req: any): Promise<{ count: number }> {
    const userId = req.user.userId;
    const count = await this.notificationsService.clearAll(userId);
    return { count };
  }
}
