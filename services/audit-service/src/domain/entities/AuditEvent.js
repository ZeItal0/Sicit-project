export class AuditEvent {
  constructor({
    id,
    tenantId,
    userId,
    userEmail,
    action,
    resourceType,
    resourceId,
    metadata = {},
    createdAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.action = action;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}