import crypto from "crypto";
import { StreamSession } from "../../domain/entities/StreamSession.js";
import { StreamParticipant } from "../../domain/entities/StreamParticipant.js";

export class CreateStreamSessionUseCase {
  constructor(
    streamSessionRepository,
    streamParticipantRepository,
    communicationServiceClient
  ) {
    this.streamSessionRepository = streamSessionRepository;
    this.streamParticipantRepository = streamParticipantRepository;
    this.communicationServiceClient = communicationServiceClient;
  }

  async execute({ tenantId, title, description, hostId, visibility, token, sectorId }) {
    if (!tenantId || !title || !hostId) {
      throw new Error("Campos obrigatórios não informados");
    }

    let chatChannelId = null;

    if (this.communicationServiceClient && token) {
      const chatChannel = await this.communicationServiceClient.createLiveChatChannel({
        token,
        title,
        description
      });

      chatChannelId = chatChannel.id;
    }

    const session = new StreamSession({
      id: crypto.randomUUID(),
      tenantId,
      title: title.trim(),
      description: description || null,
      hostId,
      visibility: visibility || "public",
      status: "scheduled",
      chatChannelId,
      sectorId: sectorId || null
    });

    const createdSession = await this.streamSessionRepository.create(session);

    await this.streamParticipantRepository.create(
      new StreamParticipant({
        tenantId,
        streamId: createdSession.id,
        userId: hostId,
        role: "host"
      })
    );

    return createdSession;
  }
}