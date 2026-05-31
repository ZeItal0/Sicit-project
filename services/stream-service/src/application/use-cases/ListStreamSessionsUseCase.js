export class ListStreamSessionsUseCase {
  constructor(streamSessionRepository) {
    this.streamSessionRepository = streamSessionRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId é obrigatório");
    }

    return this.streamSessionRepository.findAllByTenantId(tenantId);
  }
}