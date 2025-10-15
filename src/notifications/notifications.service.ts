import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGatewayService } from './notification-gateway.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
import { Notification, NotificationSettings } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGatewayService,
  ) {}

  /**
   * Создание уведомления
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    this.logger.debug(`Creating notification for user ${dto.userId}`);

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
        createdBy: dto.createdBy,
      },
    });

    // Отправить через SSE
    this.gateway.sendToUser(notification.userId, notification);

    return notification;
  }

  /**
   * Массовое создание уведомлений
   */
  async createMany(dtos: CreateNotificationDto[]): Promise<number> {
    this.logger.debug(`Creating ${dtos.length} notifications`);

    const result = await this.prisma.notification.createMany({
      data: dtos.map((dto) => ({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
        createdBy: dto.createdBy,
      })),
    });

    return result.count;
  }

  /**
   * Получение списка уведомлений пользователя
   */
  async getForUser(
    userId: number,
    filter: NotificationFilterDto,
  ): Promise<Notification[]> {
    const where: any = {
      userId,
      isDeleted: false,
    };

    if (filter.isRead !== undefined) {
      where.isRead = filter.isRead;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter.limit,
      skip: filter.skip,
    });
  }

  /**
   * Получение одного уведомления
   */
  async getOne(id: number, userId: number): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Количество непрочитанных уведомлений
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        isDeleted: false,
      },
    });
  }

  /**
   * Отметить как прочитанное
   */
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.getOne(id, userId);

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Отметить все как прочитанные
   */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        isDeleted: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Удаление уведомления (мягкое удаление)
   */
  async delete(id: number, userId: number): Promise<void> {
    const notification = await this.getOne(id, userId);

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: { isDeleted: true },
    });
  }

  /**
   * Очистить все уведомления (мягкое удаление)
   */
  async clearAll(userId: number): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isDeleted: false,
      },
      data: { isDeleted: true },
    });

    return result.count;
  }

  /**
   * Получить настройки уведомлений пользователя
   */
  async getSettings(userId: number): Promise<NotificationSettings> {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    // Создать настройки по умолчанию, если не существуют
    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  /**
   * Обновить настройки уведомлений
   */
  async updateSettings(
    userId: number,
    dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    // Убедиться, что настройки существуют
    await this.getSettings(userId);

    return this.prisma.notificationSettings.update({
      where: { userId },
      data: dto,
    });
  }
}
