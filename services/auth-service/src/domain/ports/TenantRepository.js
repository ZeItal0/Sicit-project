export class TenantRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findByDomain(_domain) {
    throw new Error("Método findByDomain precisa ser implementado");
  }
}