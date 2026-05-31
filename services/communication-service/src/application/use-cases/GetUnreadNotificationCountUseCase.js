export class GetUnreadNotificationCountUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ tenantId, userId }) {
    if (!tenantId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const unreadCount = await this.notificationRepository.countUnreadByUserId(
      tenantId,
      userId
    );

    return { unreadCount };
  }
}