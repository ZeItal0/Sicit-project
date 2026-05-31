export class SaveStreamRecordingUseCase {
  constructor(streamSessionRepository) {
    this.streamSessionRepository = streamSessionRepository;
  }

  async execute({ streamId, userId, recordingUrl }) {
    if (!streamId || !userId || !recordingUrl) {
      throw new Error("streamId, userId e recordingUrl são obrigatórios");
    }

    const session = await this.streamSessionRepository.findById(streamId);

    if (!session) {
      throw new Error("Transmissão não encontrada");
    }

    if (session.hostId !== userId) {
      throw new Error("Somente o host pode salvar a gravação");
    }

    return this.streamSessionRepository.updateRecordingUrl(
      streamId,
      recordingUrl
    );
  }
}