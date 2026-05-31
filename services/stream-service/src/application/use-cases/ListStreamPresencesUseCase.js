export class ListStreamPresencesUseCase {
  constructor(streamPresenceRepository) {
    this.streamPresenceRepository = streamPresenceRepository;
  }

  async execute({ streamId }) {
    if (!streamId) {
      throw new Error("StreamId é obrigatório");
    }

    return this.streamPresenceRepository.findByStreamId(streamId);
  }
}