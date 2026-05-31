import crypto from "crypto";
import { Role } from "../../domain/entities/Role.js";

export class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute({ tenantId, name, description }) {
    if (!tenantId || !name) {
      throw new Error("Campos obrigatórios não informados");
    }

    const normalizedName = name.trim();

    const existingRole = await this.roleRepository.findByNameAndTenantId(
      normalizedName,
      tenantId
    );

    if (existingRole) {
      throw new Error("Já existe uma role com esse nome neste tenant");
    }

    const role = new Role({
      id: crypto.randomUUID(),
      tenantId,
      name: normalizedName,
      description,
    });

    return this.roleRepository.create(role);
  }
}