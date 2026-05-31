export class StreamSessionRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

  async findById(_id) {
    throw new Error("Método findById precisa ser implementado");
  }

  async updateStatus(_id, _statusData) {
    throw new Error("Método updateStatus precisa ser implementado");
  }
}