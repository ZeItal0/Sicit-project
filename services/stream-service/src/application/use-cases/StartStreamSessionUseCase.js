export class StartStreamSessionUseCase {
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
      throw new Error("Somente o host pode iniciar a transmissão");
    }

    if (session.status === "ended") {
      throw new Error("Transmissão encerrada não pode ser reiniciada");
    }

    if (session.status === "live") {
      throw new Error("Transmissão já está ao vivo");
    }

    return this.streamSessionRepository.updateStatus(streamId, {
      status: "live",
      startedAt: new Date()
    });
  }
}