import { UserRepository } from "../../domain/ports/UserRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaUserRepository extends UserRepository {
  async create(data) {
    return prisma.user.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        roleId: data.roleId || null,
        sectorId: data.sectorId || null,
        externalId: data.externalId || null,
        source: data.source || "LOCAL",
        status: data.status,
        lastSyncAt: data.lastSyncAt || null,
      },
      include: {
        role: true,
        sector: true,
      },
    });
  }

  async findAllByTenantId(tenantId) {
    return prisma.user.findMany({
      where: { tenantId },
      include: {
        role: true,
        sector: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByEmailAndTenantId(email, tenantId) {
    return prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async syncFromLdap(data) {
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: data.tenantId,
        email: data.email,
      },
    });

    if (existingUser) {
      return prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: data.name,
          externalId: data.externalId,
          source: "LDAP",
          status: "ACTIVE",
          lastSyncAt: new Date(),
        },
        include: {
          role: true,
          sector: true,
        },
      });
    }

    return prisma.user.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        externalId: data.externalId,
        source: "LDAP",
        status: "ACTIVE",
        lastSyncAt: new Date(),
      },
      include: {
        role: true,
        sector: true,
      },
    });
  }
  async findByExternalIdAndTenantId(externalId, tenantId) {
    return prisma.user.findFirst({
      where: {
        externalId,
        tenantId
      },
      include: {
        role: true,
        sector: true
      }
    });
  }
  async assignSector(userId, sectorId) {
    return prisma.user.update({
      where: {
        id: userId
      },
      data: {
        sectorId: sectorId
      },
      include: {
        role: true,
        sector: true
      }
    });
  }

  async assignRole(userId, roleId) {
    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
        sector: true
      }
    });
  }

  async updateStatus(userId, status) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        role: true,
        sector: true
      }
    });
  }

  async syncFromHr(data) {
  const existingUser = await prisma.user.findFirst({
    where: {
      tenantId: data.tenantId,
      email: data.email,
    },
  });

  if (existingUser) {
    return prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: data.name,
        externalId: data.externalId,
        roleId: data.roleId || null,
        sectorId: data.sectorId || null,
        source: "HR",
        status: "ACTIVE",
        lastSyncAt: new Date(),
      },
      include: {
        role: true,
        sector: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      email: data.email,
      externalId: data.externalId,
      roleId: data.roleId || null,
      sectorId: data.sectorId || null,
      source: "HR",
      status: "ACTIVE",
      lastSyncAt: new Date(),
    },
    include: {
      role: true,
      sector: true,
    },
  });
}
}