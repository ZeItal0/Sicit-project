import crypto from "crypto";
import { Notification } from "../../domain/entities/Notification.js";

export class CreateNotificationUseCase {
  constructor(notificationRepository, emitNotificationToUser) {
    this.notificationRepository = notificationRepository;
    this.emitNotificationToUser = emitNotificationToUser;
  }

  async execute({
    tenantId,
    userId,
    type,
    content,
    channelId = null,
    messageId = null,
    senderId = null
  }) {
    if (!tenantId || !userId || !type || !content) {
      throw new Error("tenantId, userId, type e content são obrigatórios");
    }

    const notification = new Notification({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      type,
      channelId,
      messageId,
      senderId,
      content
    });

    const saved = await this.notificationRepository.create(notification);

    if (this.emitNotificationToUser) {
      this.emitNotificationToUser(userId, saved);
    }

    return saved;
  }
}