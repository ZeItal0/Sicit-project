import crypto from "crypto";
import { Permission } from "../../domain/entities/Permission.js";

export class CreatePermissionUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute({ code, name, description }) {
    if (!code || !name) {
      throw new Error("Campos obrigatórios não informados");
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingPermission = await this.permissionRepository.findByCode(normalizedCode);
    if (existingPermission) {
      throw new Error("Já existe uma permissão com esse código");
    }

    const permission = new Permission({
      id: crypto.randomUUID(),
      code: normalizedCode,
      name: name.trim(),
      description,
    });

    return this.permissionRepository.create(permission);
  }
}