export class StreamPresence {
  constructor({
    id,
    tenantId,
    streamId,
    userId,
    email,
    role = "viewer",
    joinedAt = new Date(),
    leftAt = null,
    durationSeconds = null
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.streamId = streamId;
    this.userId = userId;
    this.email = email;
    this.role = role;
    this.joinedAt = joinedAt;
    this.leftAt = leftAt;
    this.durationSeconds = durationSeconds;
  }
}