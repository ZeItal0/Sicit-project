export class CreateHrIntegrationConfigUseCase {
  constructor(hrIntegrationConfigRepository) {
    this.hrIntegrationConfigRepository = hrIntegrationConfigRepository;
  }

  async execute(data) {
    if (!data.tenantId) {
      throw new Error("TenantId obrigatório");
    }

    if (
      !data.apiUrl ||
      !data.apiToken ||
      !data.employeesEndpoint ||
      !data.sectorsEndpoint ||
      !data.rolesEndpoint
    ) {
      throw new Error("URL da API, token e endpoints são obrigatórios");
    }

    return this.hrIntegrationConfigRepository.create(data);
  }
}