export class PermissionRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAll() {
    throw new Error("Método findAll precisa ser implementado");
  }

  async findByCode(_code) {
    throw new Error("Método findByCode precisa ser implementado");
  }
}