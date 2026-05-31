export class Message {
  constructor({
    id,
    tenantId,
    channelId,
    senderId,
    content,
    type = "text",
    createdAt = new Date(),
    updatedAt = null
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.channelId = channelId;
    this.senderId = senderId;
    this.content = content;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}