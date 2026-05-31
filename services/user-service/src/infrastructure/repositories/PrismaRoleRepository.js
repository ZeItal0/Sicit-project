import { RoleRepository } from "../../domain/ports/RoleRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaRoleRepository extends RoleRepository {
  async create(data) {
    return prisma.role.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findAllByTenantId(tenantId) {
    return prisma.role.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByNameAndTenantId(name, tenantId) {
    return prisma.role.findFirst({
      where: { name, tenantId },
    });
  }
}