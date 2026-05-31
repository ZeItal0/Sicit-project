export class ChannelMember {
  constructor({
    id,
    tenantId,
    channelId,
    userId,
    joinedAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.channelId = channelId;
    this.userId = userId;
    this.joinedAt = joinedAt;
  }
}