export class ListDirectChannelsUseCase {
  constructor(channelRepository, channelMemberRepository) {
    this.channelRepository = channelRepository;
    this.channelMemberRepository = channelMemberRepository;
  }

  async execute({ tenantId, userId }) {
    if (!tenantId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const channelIds = await this.channelMemberRepository.findChannelIdsByUserId(
      tenantId,
      userId
    );

    return this.channelRepository.findAllDirectChannelsByIds(tenantId, channelIds);
  }
}