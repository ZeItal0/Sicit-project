export class ListPresenceUseCase {
  constructor(presenceRepository) {
    this.presenceRepository = presenceRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId é obrigatório");
    }

    return this.presenceRepository.findAllByTenantId(tenantId);
  }
}