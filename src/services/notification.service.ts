import { io } from "socket.io-client";
import {
  CreateNotificationDTO,
  ListNotificationsQueryDTO,
  MarkAsReadDTO,
} from "../dtos/notificatoin.dto";
import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  constructor(private repo = new NotificationRepository()) {}

  listForUser(userId: string, query: ListNotificationsQueryDTO) {
    return this.repo.findByUser(userId, {
      page: query.page,
      limit: query.limit,
      read: query.read,
    });
  }

  async notify(data: CreateNotificationDTO) {
    const saved = await this.repo.create(data);

    if (io) {
      io(saved.to.toString()).emit("notification", saved);
    }

    return saved;
  }

  async markRead(userId: string, dto: MarkAsReadDTO) {
    const updated = await this.repo.markRead(dto.notificationId, userId);
    if (!updated) throw new Error("Notification not found");
    return updated;
  }

  markAllRead(userId: string) {
    return this.repo.markAllRead(userId);
  }

  unreadCount(userId: string) {
    return this.repo.unreadCount(userId);
  }
}
