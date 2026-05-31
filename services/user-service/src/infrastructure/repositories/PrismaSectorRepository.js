import { SectorRepository } from "../../domain/ports/SectorRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaSectorRepository extends SectorRepository {
  async create(data) {
    return prisma.sector.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findAllByTenantId(tenantId) {
    return prisma.sector.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByNameAndTenantId(name, tenantId) {
    return prisma.sector.findFirst({
      where: { name, tenantId },
    });
  }
  async update({ id, tenantId, name, description }) {
    return prisma.sector.update({
      where: { id },
      data: {
        name,
        description
      }
    });
  }
  async delete({ id, tenantId }) {
  return prisma.sector.delete({
    where: {
      id
    }
  });
}
}