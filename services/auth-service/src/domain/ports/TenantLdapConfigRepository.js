export class TenantLdapConfigRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findByTenantId(_tenantId) {
    throw new Error("Método findByTenantId precisa ser implementado");
  }
}