export class TenantLdapConfig {
  constructor({
    id,
    tenantId,
    ldapUrl,
    baseDn,
    bindDn,
    bindPassword,
    userAttribute = "uid",
    isActive = true
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.ldapUrl = ldapUrl;
    this.baseDn = baseDn;
    this.bindDn = bindDn;
    this.bindPassword = bindPassword;
    this.userAttribute = userAttribute;
    this.isActive = isActive;
  }
}