export class NotificationRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findAllByUserId(_tenantId, _userId) {
    throw new Error("Método findAllByUserId precisa ser implementado");
  }

  async markAsRead(_notificationId, _tenantId, _userId) {
    throw new Error("Método markAsRead precisa ser implementado");
  }

  async countUnreadByUserId(_tenantId, _userId) {
    throw new Error("Método countUnreadByUserId precisa ser implementado");
  }
}