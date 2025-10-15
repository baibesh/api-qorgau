import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { NotificationResponseDto } from './dto/notification-response.dto';

interface NotificationEvent {
  userId: number;
  notification: NotificationResponseDto;
}

@Injectable()
export class NotificationGatewayService {
  private notificationSubject = new Subject<NotificationEvent>();

  /**
   * Получить Observable для уведомлений конкретного пользователя
   */
  getNotificationsStream(userId: number) {
    return new Subject<MessageEvent>();
  }

  /**
   * Отправить уведомление конкретному пользователю
   */
  sendToUser(userId: number, notification: NotificationResponseDto): void {
    this.notificationSubject.next({ userId, notification });
  }

  /**
   * Broadcast уведомление нескольким пользователям
   */
  sendToUsers(
    userIds: number[],
    notification: NotificationResponseDto,
  ): void {
    userIds.forEach((userId) => {
      this.notificationSubject.next({ userId, notification });
    });
  }

  /**
   * Получить глобальный поток уведомлений
   */
  getGlobalStream() {
    return this.notificationSubject.asObservable();
  }
}
