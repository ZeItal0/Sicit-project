export class StreamSession {
  constructor({
    id,
    tenantId,
    title,
    description = null,
    hostId,
    status = "scheduled",
    visibility = "public",
    chatChannelId = null,
    createdAt = new Date(),
    startedAt = null,
    endedAt = null,
    sectorId = null,
    recordingUrl = null
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.title = title;
    this.description = description;
    this.hostId = hostId;
    this.status = status;
    this.visibility = visibility;
    this.chatChannelId = chatChannelId;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.sectorId = sectorId;
    this.recordingUrl = recordingUrl;
  }
}