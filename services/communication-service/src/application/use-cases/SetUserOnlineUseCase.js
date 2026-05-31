export class SetUserOnlineUseCase {
  constructor(presenceRepository) {
    this.presenceRepository = presenceRepository;
  }

  async execute({ tenantId, userId, socketId }) {
    if (!tenantId || !userId || !socketId) {
      throw new Error("Campos obrigatórios não informados");
    }

    return this.presenceRepository.setOnline({
      tenantId,
      userId,
      socketId
    });
  }
}