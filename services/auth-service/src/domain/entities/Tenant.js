export class Tenant {
  constructor({ id, companyName, domain, status = "ACTIVE" }) {
    this.id = id;
    this.companyName = companyName;
    this.domain = domain;
    this.status = status;
  }
}