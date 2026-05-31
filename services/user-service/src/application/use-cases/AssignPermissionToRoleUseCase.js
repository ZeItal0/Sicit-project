import crypto from "crypto";
import { RolePermission } from "../../domain/entities/RolePermission.js";

export class AssignPermissionToRoleUseCase {
  constructor(rolePermissionRepository) {
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async execute({ roleId, permissionId }) {
    if (!roleId || !permissionId) {
      throw new Error("RoleId e PermissionId são obrigatórios");
    }

    const rolePermission = new RolePermission({
      id: crypto.randomUUID(),
      roleId,
      permissionId,
    });

    return this.rolePermissionRepository.create(rolePermission);
  }
}