export class ListSectorsUseCase {
  constructor(sectorRepository) {
    this.sectorRepository = sectorRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId é obrigatório");
    }

    return this.sectorRepository.findAllByTenantId(tenantId);
  }
}