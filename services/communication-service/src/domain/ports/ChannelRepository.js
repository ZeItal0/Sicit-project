export class ChannelRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByTenantId(_tenantId) {
    throw new Error("Método findAllByTenantId precisa ser implementado");
  }

  async findById(_id) {
    throw new Error("Método findById precisa ser implementado");
  }

  async findDirectChannelByIdList(_tenantId, _channelIds) {
    throw new Error("Método findDirectChannelByIdList precisa ser implementado");
  }

  async findAllDirectChannelsByIds(_tenantId, _channelIds) {
    throw new Error("Método findAllDirectChannelsByIds precisa ser implementado");
  }
}