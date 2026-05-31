import { TenantLdapConfigRepository } from "../../domain/ports/TenantLdapConfigRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaTenantLdapConfigRepository extends TenantLdapConfigRepository {
  async create(data) {
    return prisma.tenantLdapConfig.create({
      data: {
        tenantId: data.tenantId,
        ldapUrl: data.ldapUrl,
        baseDn: data.baseDn,
        bindDn: data.bindDn,
        bindPassword: data.bindPassword,
        userAttribute: data.userAttribute || "uid",
        isActive: data.isActive ?? true
      }
    });
  }

  async findByTenantId(tenantId) {
    return prisma.tenantLdapConfig.findFirst({
      where: {
        tenantId,
        isActive: true
      }
    });
  }
}