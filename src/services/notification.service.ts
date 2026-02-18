import {
  CreateNotificationDTO,
  ListNotificationsQueryDTO,
  MarkAsReadDTO,
} from "../dtos/notificatoin.dto";
import { NotificationModel } from "../models/notification.model";
import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  constructor(private repo = new NotificationRepository()) {}

  create(dto: CreateNotificationDTO) {
    return this.repo.create(dto);
  }

  listForUser(userId: string, query: ListNotificationsQueryDTO) {
    return this.repo.findByUser(userId, {
      page: query.page,
      limit: query.limit,
      read: query.read,
    });
  }
  async notify(data: CreateNotificationDTO) {
    return this.repo.create(data);
  }
  async markRead(userId: string, dto: MarkAsReadDTO) {
    const updated = await this.repo.markRead(dto.notificationId, userId);
    if (!updated) {
      // keep simple; you can throw custom error class too
      throw new Error("Notification not found");
    }
    return updated;
  }

  markAllRead(userId: string) {
    return this.repo.markAllRead(userId);
  }

  unreadCount(userId: string) {
    return this.repo.unreadCount(userId);
  }
}
