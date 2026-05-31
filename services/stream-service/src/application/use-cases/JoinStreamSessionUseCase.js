import { StreamParticipant } from "../../domain/entities/StreamParticipant.js";

export class JoinStreamSessionUseCase {
  constructor(
    streamSessionRepository,
    streamParticipantRepository,
    communicationServiceClient
  ) {
    this.streamSessionRepository = streamSessionRepository;
    this.streamParticipantRepository = streamParticipantRepository;
    this.communicationServiceClient = communicationServiceClient;
  }

  async execute({ tenantId, streamId, userId, token }) {
    if (!tenantId || !streamId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const session = await this.streamSessionRepository.findById(streamId);

    if (!session) {
      throw new Error("Transmissão não encontrada");
    }

    const participant = await this.streamParticipantRepository.create(
      new StreamParticipant({
        tenantId,
        streamId,
        userId,
        role: session.hostId === userId ? "host" : "viewer"
      })
    );

    if (session.chatChannelId && this.communicationServiceClient && token) {
      await this.communicationServiceClient.joinChannel({
        token,
        channelId: session.chatChannelId
      });
    }

    return {
      ...participant,
      chatChannelId: session.chatChannelId
    };
  }
}