import crypto from "crypto";
import { Channel } from "../../domain/entities/Channel.js";

export class CreateDirectChannelUseCase {
  constructor(channelRepository, channelMemberRepository) {
    this.channelRepository = channelRepository;
    this.channelMemberRepository = channelMemberRepository;
  }

  async execute({ tenantId, currentUserId, targetUserId }) {
    if (!tenantId || !currentUserId || !targetUserId) {
      throw new Error("Campos obrigatórios não informados");
    }

    if (currentUserId === targetUserId) {
      throw new Error("Não é possível criar DM com o mesmo usuário");
    }

    const currentUserChannelIds =
      await this.channelMemberRepository.findChannelIdsByUserId(
        tenantId,
        currentUserId
      );

    const candidateChannels = await this.channelRepository.findAllDirectChannelsByIds(
      tenantId,
      currentUserChannelIds
    );

    for (const channel of candidateChannels) {
      const members = await this.channelMemberRepository.findMembersByChannelId(channel.id);
      const memberIds = members.map((m) => m.userId).sort();

      const expected = [currentUserId, targetUserId].sort();

      if (
        memberIds.length === 2 &&
        memberIds[0] === expected[0] &&
        memberIds[1] === expected[1]
      ) {
        return channel;
      }
    }

    const directChannel = new Channel({
      id: crypto.randomUUID(),
      tenantId,
      name: "DM",
      description: null,
      type: "direct",
      createdBy: currentUserId
    });

    const createdChannel = await this.channelRepository.create(directChannel);

    await this.channelMemberRepository.create({
      tenantId,
      channelId: createdChannel.id,
      userId: currentUserId
    });

    await this.channelMemberRepository.create({
      tenantId,
      channelId: createdChannel.id,
      userId: targetUserId
    });

    return createdChannel;
  }
}