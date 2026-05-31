import { RolePermissionRepository } from "../../domain/ports/RolePermissionRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaRolePermissionRepository extends RolePermissionRepository {
  async create(data) {
    return prisma.rolePermission.create({
      data: {
        id: data.id,
        roleId: data.roleId,
        permissionId: data.permissionId,
      },
    });
  }

  async findAllByRoleId(roleId) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async roleHasPermission(roleId, permissionCode) {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: {
          code: permissionCode,
        },
      },
      include: {
        permission: true,
      },
    });

    return !!rolePermission;
  }
}