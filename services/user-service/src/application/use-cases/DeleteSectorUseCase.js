export class DeleteSectorUseCase {
  constructor(sectorRepository) {
    this.sectorRepository = sectorRepository;
  }

  async execute({ id, tenantId }) {
    if (!id || !tenantId) {
      throw new Error("Id e tenantId são obrigatórios");
    }

    return this.sectorRepository.delete({
      id,
      tenantId
    });
  }
}