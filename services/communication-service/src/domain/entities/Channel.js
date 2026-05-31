export class Channel {
  constructor({
    id,
    tenantId,
    name,
    description = null,
    type = "public",
    createdBy,
    createdAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.description = description;
    this.type = type;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}