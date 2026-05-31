export class ListRolePermissionsUseCase {
  constructor(rolePermissionRepository) {
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async execute({ roleId }) {
    if (!roleId) {
      throw new Error("RoleId é obrigatório");
    }

    return this.rolePermissionRepository.findAllByRoleId(roleId);
  }
}