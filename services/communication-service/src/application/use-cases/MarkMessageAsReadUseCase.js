import crypto from "crypto";
import { MessageRead } from "../../domain/entities/MessageRead.js";

export class MarkMessageAsReadUseCase {
  constructor(messageReadRepository, channelMemberRepository, emitMessageRead) {
    this.messageReadRepository = messageReadRepository;
    this.channelMemberRepository = channelMemberRepository;
    this.emitMessageRead = emitMessageRead;
  }

  async execute({ tenantId, channelId, messageId, userId }) {
    if (!tenantId || !channelId || !messageId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const isMember = await this.channelMemberRepository.isMember(channelId, userId);
    if (!isMember) {
      throw new Error("Usuário não participa do canal");
    }

    const messageRead = new MessageRead({
      id: crypto.randomUUID(),
      tenantId,
      channelId,
      messageId,
      userId
    });

    const result = await this.messageReadRepository.markAsRead(messageRead);

    if (this.emitMessageRead) {
      this.emitMessageRead(result);
    }

    return result;
  }
}