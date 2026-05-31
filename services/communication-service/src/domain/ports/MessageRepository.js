export class MessageRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByChannelId(_channelId) {
    throw new Error("Método findAllByChannelId precisa ser implementado");
  }

  async findLastByChannelId(_channelId) {
    throw new Error("Método findLastByChannelId precisa ser implementado");
  }

  async findAllByChannelIdExcludingSender(_channelId, _senderId) {
    throw new Error("Método findAllByChannelIdExcludingSender precisa ser implementado");
  }
}