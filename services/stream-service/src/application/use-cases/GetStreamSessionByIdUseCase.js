export class GetStreamSessionByIdUseCase {
  constructor(streamSessionRepository, streamParticipantRepository) {
    this.streamSessionRepository = streamSessionRepository;
    this.streamParticipantRepository = streamParticipantRepository;
  }

  async execute({ streamId }) {
    if (!streamId) {
      throw new Error("StreamId é obrigatório");
    }

    const session = await this.streamSessionRepository.findById(streamId);

    if (!session) {
      throw new Error("Transmissão não encontrada");
    }

    const participants = await this.streamParticipantRepository.findByStreamId(streamId);

    return {
      ...session,
      participants
    };
  }
}