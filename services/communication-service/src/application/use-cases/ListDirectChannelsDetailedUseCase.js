export class ListDirectChannelsDetailedUseCase {
  constructor(
    channelRepository,
    channelMemberRepository,
    messageRepository,
    presenceRepository,
    userServiceClient,
    messageReadRepository
  ) {
    this.channelRepository = channelRepository;
    this.channelMemberRepository = channelMemberRepository;
    this.messageRepository = messageRepository;
    this.presenceRepository = presenceRepository;
    this.userServiceClient = userServiceClient;
    this.messageReadRepository = messageReadRepository;
  }

  async execute({ tenantId, userId, token }) {
    if (!tenantId || !userId) {
      throw new Error("Campos obrigatórios não informados");
    }

    const channelIds = await this.channelMemberRepository.findChannelIdsByUserId(
      tenantId,
      userId
    );

    const directChannels = await this.channelRepository.findAllDirectChannelsByIds(
      tenantId,
      channelIds
    );

    const enriched = [];

    for (const channel of directChannels) {
      const members = await this.channelMemberRepository.findMembersByChannelId(channel.id);

      const otherMember = members.find((member) => member.userId !== userId);

      const lastMessage = await this.messageRepository.findLastByChannelId(channel.id);

      const foreignMessages =
        await this.messageRepository.findAllByChannelIdExcludingSender(
          channel.id,
          userId
        );

      const foreignMessageIds = foreignMessages.map((msg) => msg.id);

      const unreadCount = await this.messageReadRepository.countUnreadMessages(
        foreignMessageIds,
        userId
      );

      let presence = null;
      let otherUserData = null;

      if (otherMember) {
        presence = await this.presenceRepository.findByUserId(
          tenantId,
          otherMember.userId
        );

        if (this.userServiceClient && token) {
          try {
            otherUserData = await this.userServiceClient.getUserByExternalId({
              token,
              externalId: otherMember.userId
            });
          } catch {
            otherUserData = null;
          }
        }
      }

      enriched.push({
        ...channel,
        otherUser: otherMember
          ? {
              id: otherMember.userId,
              joinedAt: otherMember.joinedAt,
              name: otherUserData?.name || null,
              email: otherUserData?.email || null,
              source: otherUserData?.source || null,
              presence: presence
                ? {
                    status: presence.status,
                    lastSeenAt: presence.lastSeenAt,
                    updatedAt: presence.updatedAt
                  }
                : null
            }
          : null,
        lastMessage,
        unreadCount
      });
    }

    return enriched;
  }
}