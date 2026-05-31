export class PresenceRepository {
  async setOnline(_data) {
    throw new Error("Método setOnline precisa ser implementado");
  }

  async setOffline(_data) {
    throw new Error("Método setOffline precisa ser implementado");
  }

  async findByUserId(_tenantId, _userId) {
    throw new Error("Método findByUserId precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

}