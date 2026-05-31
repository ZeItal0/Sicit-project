export class SectorRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

  async findByNameAndTenantId(_name, _tenantId) {
    throw new Error("Método findByNameAndTenantId precisa ser implementado");
  }
  async update(_data) {
    throw new Error("Método update precisa ser implementado");
  }

  async delete(_data) {
    throw new Error("Método delete precisa ser implementado");
  }
}