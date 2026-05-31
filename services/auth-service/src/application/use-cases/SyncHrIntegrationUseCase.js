export class SyncHrIntegrationUseCase {
  constructor(hrIntegrationConfigRepository, hrSyncService) {
    this.hrIntegrationConfigRepository = hrIntegrationConfigRepository;
    this.hrSyncService = hrSyncService;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId obrigatório");
    }

    const config =
      await this.hrIntegrationConfigRepository.findActiveByTenantId(tenantId);

    if (!config) {
      throw new Error("Configuração de RH não encontrada");
    }

    const hrData = await this.hrSyncService.fetchFromHr({ config });

    const result = await this.hrSyncService.sendToUserService({
      tenantId,
      data: hrData,
    });

    return {
      message: "Sincronização com RH executada com sucesso",
      provider: config.provider,
      result,
    };
  }
}