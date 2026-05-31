export class RolePermissionRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByRoleId(_roleId) {
    throw new Error("Método findAllByRoleId precisa ser implementado");
  }

  async roleHasPermission(_roleId, _permissionCode) {
    throw new Error("Método roleHasPermission precisa ser implementado");
  }
}