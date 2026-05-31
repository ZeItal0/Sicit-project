import crypto from "crypto";
import { MessageRepository } from "../../domain/ports/MessageRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoMessageRepository extends MessageRepository {
  constructor() {
    super();
    this.collection = db.collection("messages");
  }

  async create(data) {
    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      channelId: data.channelId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || "text",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || null
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      channelId: doc.channelId,
      senderId: doc.senderId,
      content: doc.content,
      type: doc.type,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async findAllByChannelId(channelId) {
    const docs = await this.collection
      .find({ channelId })
      .sort({ createdAt: 1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }
  async findLastByChannelId(channelId) {
    const doc = await this.collection
      .find({ channelId })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      id: _id,
      ...rest
    };
  }

  async findAllByChannelIdExcludingSender(channelId, senderId) {
    const docs = await this.collection
      .find({
        channelId,
        senderId: { $ne: senderId }
      })
      .sort({ createdAt: 1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }
}