export class TenantAdmin {
  constructor({ id, tenantId, name, email, passwordHash, role = "TENANT_ADMIN" }) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }
}