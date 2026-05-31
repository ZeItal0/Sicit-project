export class RoleRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

  async findByNameAndTenantId(_name, _tenantId) {
    throw new Error("Método findByNameAndTenantId precisa ser implementado");
  }
}