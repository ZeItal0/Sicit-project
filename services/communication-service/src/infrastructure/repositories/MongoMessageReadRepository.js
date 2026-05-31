import crypto from "crypto";
import { MessageReadRepository } from "../../domain/ports/MessageReadRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoMessageReadRepository extends MessageReadRepository {
  constructor() {
    super();
    this.collection = db.collection("message_reads");
  }

  async markAsRead(data) {
    const existing = await this.collection.findOne({
      messageId: data.messageId,
      userId: data.userId
    });

    if (existing) {
      return {
        id: existing._id,
        tenantId: existing.tenantId,
        channelId: existing.channelId,
        messageId: existing.messageId,
        userId: existing.userId,
        readAt: existing.readAt
      };
    }

    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      channelId: data.channelId,
      messageId: data.messageId,
      userId: data.userId,
      readAt: data.readAt || new Date()
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      channelId: doc.channelId,
      messageId: doc.messageId,
      userId: doc.userId,
      readAt: doc.readAt
    };
  }

  async findAllByMessageId(messageId) {
    const docs = await this.collection
      .find({ messageId })
      .sort({ readAt: 1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }

  async hasUserReadMessage(messageId, userId) {
    const doc = await this.collection.findOne({ messageId, userId });
    return !!doc;
  }

  async countUnreadMessages(messageIds, userId) {
    if (!messageIds.length) return 0;

    const readDocs = await this.collection
      .find({
        messageId: { $in: messageIds },
        userId
      })
      .toArray();

    const readMessageIds = new Set(readDocs.map((doc) => doc.messageId));

    const unreadCount = messageIds.filter((id) => !readMessageIds.has(id)).length;

    return unreadCount;
  }
}