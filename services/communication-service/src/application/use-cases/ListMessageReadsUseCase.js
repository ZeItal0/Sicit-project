export class ListMessageReadsUseCase {
  constructor(messageReadRepository) {
    this.messageReadRepository = messageReadRepository;
  }

  async execute({ messageId }) {
    if (!messageId) {
      throw new Error("MessageId é obrigatório");
    }

    return this.messageReadRepository.findAllByMessageId(messageId);
  }
}