export class GetUserPresenceUseCase {
  constructor(presenceRepository) {
    this.presenceRepository = presenceRepository;
  }

  async execute({ tenantId, userId }) {
    if (!tenantId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    return this.presenceRepository.findByUserId(tenantId, userId);
  }
}