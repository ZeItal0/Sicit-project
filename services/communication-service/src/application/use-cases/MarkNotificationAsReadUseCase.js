export class MarkNotificationAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ tenantId, userId, notificationId }) {
    if (!tenantId || !userId || !notificationId) {
      throw new Error("Campos obrigatórios não informados");
    }

    return this.notificationRepository.markAsRead(
      notificationId,
      tenantId,
      userId
    );
  }
}