import crypto from "crypto";
import { User } from "../../domain/entities/User.js";

export class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ tenantId, name, email, roleId, sectorId }) {
    if (!tenantId || !name || !email) {
      throw new Error("Campos obrigatórios não informados");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      throw new Error("Email inválido");
    }

    const existingUser = await this.userRepository.findByEmailAndTenantId(
      normalizedEmail,
      tenantId
    );

    if (existingUser) {
      throw new Error("Já existe um usuário com esse email neste tenant");
    }

    const user = new User({
      id: crypto.randomUUID(),
      tenantId,
      name: name.trim(),
      email: normalizedEmail,
      roleId,
      sectorId,
    });

    return this.userRepository.create(user);
  }
}