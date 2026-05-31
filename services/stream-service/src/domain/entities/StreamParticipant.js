export class StreamParticipant {
  constructor({
    id,
    tenantId,
    streamId,
    userId,
    role = "viewer",
    joinedAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.streamId = streamId;
    this.userId = userId;
    this.role = role;
    this.joinedAt = joinedAt;
  }
}