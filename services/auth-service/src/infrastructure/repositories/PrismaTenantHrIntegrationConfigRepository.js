import { prisma } from "../database/prismaClient.js";

export class PrismaTenantHrIntegrationConfigRepository {
  async create(data) {
    await prisma.tenantHrIntegrationConfig.updateMany({
      where: {
        tenantId: data.tenantId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return prisma.tenantHrIntegrationConfig.create({
      data: {
        tenantId: data.tenantId,
        provider: data.provider || "CUSTOM_API",
        apiUrl: data.apiUrl,
        apiToken: data.apiToken,
        employeesEndpoint: data.employeesEndpoint,
        sectorsEndpoint: data.sectorsEndpoint,
        rolesEndpoint: data.rolesEndpoint,
        syncEmployees: data.syncEmployees ?? true,
        syncRoles: data.syncRoles ?? true,
        syncSectors: data.syncSectors ?? true,
        frequency: data.frequency || "Diaria",
        isActive: true,
      },
    });
  }

  async findActiveByTenantId(tenantId) {
    return prisma.tenantHrIntegrationConfig.findFirst({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}