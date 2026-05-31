export class Presence {
  constructor({
    id,
    tenantId,
    userId,
    status = "offline",
    socketId = null,
    lastSeenAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.userId = userId;
    this.status = status;
    this.socketId = socketId;
    this.lastSeenAt = lastSeenAt;
    this.updatedAt = updatedAt;
  }
}