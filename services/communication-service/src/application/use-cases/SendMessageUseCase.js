import crypto from "crypto";
import { Message } from "../../domain/entities/Message.js";
import { validateText } from "../../infrastructure/services/ProfanityValidator.js";

export class SendMessageUseCase {
  constructor(
    messageRepository,
    channelMemberRepository,
    publishMessageCreated,
    emitMessageCreated
  ) {
    this.messageRepository = messageRepository;
    this.channelMemberRepository = channelMemberRepository;
    this.publishMessageCreated = publishMessageCreated;
    this.emitMessageCreated = emitMessageCreated;
  }

  async execute({tenantId, channelId, senderId, content}) {

    if (!tenantId || !channelId || !senderId || !content) {
      throw new Error(
        "Campos obrigatórios não informados"
      );

    }

    validateText(
      content
    );

    const isMember = await this.channelMemberRepository.isMember(channelId, senderId);
    if (!isMember) {
      throw new Error("Usuário não participa do canal");
    }

    const message = new Message({
      id: crypto.randomUUID(),
      tenantId,
      channelId,
      senderId,
      content: content.trim()
    });

    const createdMessage = await this.messageRepository.create(message);

    if (this.publishMessageCreated) {
      await this.publishMessageCreated(createdMessage);
    }

    if (this.emitMessageCreated) {
      this.emitMessageCreated(createdMessage);
    }

    return createdMessage;
  }
}