export class TenantAdminRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findByEmailAndTenantId(_email, _tenantId) {
    throw new Error("Método findByEmailAndTenantId precisa ser implementado");
  }
}