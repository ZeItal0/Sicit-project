export class GetUserByExternalIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ tenantId, externalId }) {
    if (!tenantId || !externalId) {
      throw new Error("TenantId e externalId são obrigatórios");
    }

    return this.userRepository.findByExternalIdAndTenantId(externalId, tenantId);
  }
}