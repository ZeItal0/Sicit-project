import crypto from "crypto";
import { Sector } from "../../domain/entities/Sector.js";

export class CreateSectorUseCase {
  constructor(sectorRepository) {
    this.sectorRepository = sectorRepository;
  }

  async execute({ tenantId, name, description }) {
    if (!tenantId || !name) {
      throw new Error("Campos obrigatórios não informados");
    }

    const normalizedName = name.trim();

    const existingSector = await this.sectorRepository.findByNameAndTenantId(
      normalizedName,
      tenantId
    );

    if (existingSector) {
      throw new Error("Já existe um setor com esse nome neste tenant");
    }

    const sector = new Sector({
      id: crypto.randomUUID(),
      tenantId,
      name: normalizedName,
      description,
    });

    return this.sectorRepository.create(sector);
  }
}