export class MessageRead {
  constructor({
    id,
    tenantId,
    channelId,
    messageId,
    userId,
    readAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.channelId = channelId;
    this.messageId = messageId;
    this.userId = userId;
    this.readAt = readAt;
  }
}