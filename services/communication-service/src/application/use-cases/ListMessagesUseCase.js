export class ListMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ channelId }) {
    if (!channelId) {
      throw new Error("ChannelId é obrigatório");
    }

    return this.messageRepository.findAllByChannelId(channelId);
  }
}