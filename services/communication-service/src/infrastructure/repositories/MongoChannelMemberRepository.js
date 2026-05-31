import crypto from "crypto";
import { ChannelMemberRepository } from "../../domain/ports/ChannelMemberRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoChannelMemberRepository extends ChannelMemberRepository {
  constructor() {
    super();
    this.collection = db.collection("channel_members");
  }

  async create(data) {
    const exists = await this.collection.findOne({
      channelId: data.channelId,
      userId: data.userId
    });

    if (exists) {
      return {
        id: exists._id,
        tenantId: exists.tenantId,
        channelId: exists.channelId,
        userId: exists.userId,
        joinedAt: exists.joinedAt
      };
    }

    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      channelId: data.channelId,
      userId: data.userId,
      joinedAt: data.joinedAt || new Date()
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      channelId: doc.channelId,
      userId: doc.userId,
      joinedAt: doc.joinedAt
    };
  }

  async isMember(channelId, userId) {
    const doc = await this.collection.findOne({ channelId, userId });
    return !!doc;
  }

  async findChannelIdsByUserId(tenantId, userId) {
    const docs = await this.collection.find({ tenantId, userId }).toArray();
    return docs.map((doc) => doc.channelId);
  }

  async findMembersByChannelId(channelId) {
    const docs = await this.collection.find({ channelId }).toArray();

    return docs.map((doc) => ({
      id: doc._id,
      tenantId: doc.tenantId,
      channelId: doc.channelId,
      userId: doc.userId,
      joinedAt: doc.joinedAt
    }));
  }
}