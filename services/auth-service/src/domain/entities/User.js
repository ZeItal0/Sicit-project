export class User {
  constructor({ id, email, role, tenantId }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.tenantId = tenantId;
  }
}