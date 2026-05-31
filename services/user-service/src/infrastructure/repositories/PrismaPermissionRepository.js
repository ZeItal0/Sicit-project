import { PermissionRepository } from "../../domain/ports/PermissionRepository.js";
import { prisma } from "../database/prismaClient.js";

export class PrismaPermissionRepository extends PermissionRepository {
  async create(data) {
    return prisma.permission.create({
      data: {
        id: data.id,
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findAll() {
    return prisma.permission.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  async findByCode(code) {
    return prisma.permission.findUnique({
      where: { code },
    });
  }
}