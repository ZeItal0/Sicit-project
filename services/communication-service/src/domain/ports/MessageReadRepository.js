export class MessageReadRepository {
  async markAsRead(_data) {
    throw new Error("Método markAsRead precisa ser implementado");
  }

  async findAllByMessageId(_messageId) {
    throw new Error("Método findAllByMessageId precisa ser implementado");
  }

  async hasUserReadMessage(_messageId, _userId) {
    throw new Error("Método hasUserReadMessage precisa ser implementado");
  }

  async countUnreadMessages(_messageIds, _userId) {
    throw new Error("Método countUnreadMessages precisa ser implementado");
  }
}