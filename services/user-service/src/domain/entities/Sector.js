export class Sector {
  constructor({ id, tenantId, name, description = null }) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.description = description;
  }
}