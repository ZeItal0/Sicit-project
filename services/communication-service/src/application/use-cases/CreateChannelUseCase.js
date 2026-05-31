import crypto from "crypto";
import { Channel } from "../../domain/entities/Channel.js";

export class CreateChannelUseCase {
  constructor(channelRepository, channelMemberRepository) {
    this.channelRepository = channelRepository;
    this.channelMemberRepository = channelMemberRepository;
  }

  async execute({ tenantId, name, description, type, createdBy }) {
    if (!tenantId || !name || !createdBy) {
      throw new Error("Campos obrigatórios não informados");
    }

    const channel = new Channel({
      id: crypto.randomUUID(),
      tenantId,
      name: name.trim(),
      description,
      type: type || "public",
      createdBy
    });

    const createdChannel = await this.channelRepository.create(channel);

    await this.channelMemberRepository.create({
      tenantId,
      channelId: createdChannel.id,
      userId: createdBy
    });


    
    return createdChannel;
  }
}