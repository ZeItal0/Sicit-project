export class JoinChannelUseCase {
  constructor(channelRepository, channelMemberRepository) {
    this.channelRepository = channelRepository;
    this.channelMemberRepository = channelMemberRepository;
  }

  async execute({ tenantId, channelId, userId }) {
    if (!tenantId || !channelId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new Error("Canal não encontrado");
    }

    return this.channelMemberRepository.create({
      tenantId,
      channelId,
      userId
    });
  }
}