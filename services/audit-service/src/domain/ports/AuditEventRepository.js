export class AuditEventRepository {
  async create(_event) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAll(_filters) {
    throw new Error("Método findAll precisa ser implementado");
  }
}