import { TenantAdminRepository } from "../../domain/ports/TenantAdminRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaTenantAdminRepository extends TenantAdminRepository {
  async create(data) {
    return prisma.tenantAdmin.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role
      }
    });
  }

  async findByEmailAndTenantId(email, tenantId) {
    return prisma.tenantAdmin.findFirst({
      where: {
        email,
        tenantId
      }
    });
  }
}