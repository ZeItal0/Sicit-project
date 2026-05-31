export class User {
  constructor({
    id,
    tenantId,
    name,
    email,
    roleId = null,
    sectorId = null,
    externalId = null,
    source = "LOCAL",
    status = "ACTIVE",
    lastSyncAt = null
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.email = email;
    this.roleId = roleId;
    this.sectorId = sectorId;
    this.externalId = externalId;
    this.source = source;
    this.status = status;
    this.lastSyncAt = lastSyncAt;
  }
}