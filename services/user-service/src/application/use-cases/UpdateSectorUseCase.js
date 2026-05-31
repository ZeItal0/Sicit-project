export class UpdateSectorUseCase {
  constructor(sectorRepository) {
    this.sectorRepository = sectorRepository;
  }

  async execute({ id, tenantId, name, description }) {
    if (!id || !tenantId || !name) {
      throw new Error("Campos obrigatórios não informados");
    }

    return this.sectorRepository.update({
      id,
      tenantId,
      name: name.trim(),
      description
    });
  }
}