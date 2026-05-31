export class ListNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ tenantId, userId }) {
    if (!tenantId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    return this.notificationRepository.findAllByUserId(tenantId, userId);
  }
}