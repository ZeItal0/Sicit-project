export class ListChannelsUseCase {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId é obrigatório");
    }

    return this.channelRepository.findAllByTenantId(tenantId);
  }
}