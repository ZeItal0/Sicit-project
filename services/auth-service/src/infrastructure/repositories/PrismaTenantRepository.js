import { TenantRepository } from "../../domain/ports/TenantRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaTenantRepository extends TenantRepository {
  async create(data) {
    return prisma.tenant.create({
      data: {
        id: data.id,
        companyName: data.companyName,
        domain: data.domain,
        status: data.status
      }
    });
  }

  async findByDomain(domain) {
    return prisma.tenant.findUnique({
      where: { domain }
    });
  }
}