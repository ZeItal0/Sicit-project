export class Notification {
  constructor({
    id,
    tenantId,
    userId,
    type,
    channelId = null,
    messageId = null,
    senderId = null,
    content = null,
    isRead = false,
    createdAt = new Date(),
    readAt = null
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.userId = userId;
    this.type = type;
    this.channelId = channelId;
    this.messageId = messageId;
    this.senderId = senderId;
    this.content = content;
    this.isRead = isRead;
    this.createdAt = createdAt;
    this.readAt = readAt;
  }
}