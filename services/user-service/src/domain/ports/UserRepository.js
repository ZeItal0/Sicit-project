export class UserRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

  async findByEmailAndTenantId(_email, _tenantId) {
    throw new Error("Método findByEmailAndTenantId precisa ser implementado");
  }

  async syncFromLdap(_data) {
    throw new Error("Método syncFromLdap precisa ser implementado");
  }

  async findByExternalIdAndTenantId(_externalId, _tenantId) {
    throw new Error("Método findByExternalIdAndTenantId precisa ser implementado");
  }
}