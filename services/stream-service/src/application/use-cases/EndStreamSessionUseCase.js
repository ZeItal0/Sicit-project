export class EndStreamSessionUseCase {
  constructor(streamSessionRepository) {
    this.streamSessionRepository = streamSessionRepository;
  }

  async execute({ streamId, userId }) {
    if (!streamId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const session = await this.streamSessionRepository.findById(streamId);

    if (!session) {
      throw new Error("Transmissão não encontrada");
    }

    if (session.hostId !== userId) {
      throw new Error("Somente o host pode encerrar a transmissão");
    }

    return this.streamSessionRepository.updateStatus(streamId, {
      status: "ended",
      endedAt: new Date()
    });
  }
}