export class GetHrIntegrationConfigUseCase {
  constructor(hrIntegrationConfigRepository) {
    this.hrIntegrationConfigRepository = hrIntegrationConfigRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId obrigatório");
    }

    return this.hrIntegrationConfigRepository.findActiveByTenantId(tenantId);
  }
}