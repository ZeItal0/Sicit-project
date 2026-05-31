import { PrismaRoleRepository } from "../infrastructure/repositories/PrismaRoleRepository.js";
import { PrismaRolePermissionRepository } from "../infrastructure/repositories/PrismaRolePermissionRepository.js";

const roleRepository = new PrismaRoleRepository();
const rolePermissionRepository = new PrismaRolePermissionRepository();

export function requirePermission(permissionCode) {
  return async (req, res, next) => {
    try {
      const { tenantId, role } = req.user;

      if (!tenantId || !role) {
        return res.status(403).json({
          message: "Usuário sem tenant ou role no token",
        });
      }

      const roleEntity = await roleRepository.findByNameAndTenantId(role, tenantId);

      if (!roleEntity) {
        return res.status(403).json({
          message: "Role não encontrada para este tenant",
        });
      }

      const hasPermission = await rolePermissionRepository.roleHasPermission(
        roleEntity.id,
        permissionCode
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Permissão '${permissionCode}' não concedida`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao validar permissão",
      });
    }
  };
}