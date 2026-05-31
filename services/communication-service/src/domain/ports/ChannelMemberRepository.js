export class ChannelMemberRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async isMember(_channelId, _userId) {
    throw new Error("Método isMember precisa ser implementado");
  }

  async findChannelIdsByUserId(_tenantId, _userId) {
    throw new Error("Método findChannelIdsByUserId precisa ser implementado");
  }

  async findMembersByChannelId(_channelId) {
    throw new Error("Método findMembersByChannelId precisa ser implementado");
  }
}