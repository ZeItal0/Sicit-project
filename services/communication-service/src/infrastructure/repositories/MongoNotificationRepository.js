import crypto from "crypto";
import { NotificationRepository } from "../../domain/ports/NotificationRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoNotificationRepository extends NotificationRepository {
  constructor() {
    super();
    this.collection = db.collection("notifications");
  }

  async create(data) {
    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      channelId: data.channelId || null,
      messageId: data.messageId || null,
      senderId: data.senderId || null,
      content: data.content || null,
      isRead: data.isRead ?? false,
      createdAt: data.createdAt || new Date(),
      readAt: data.readAt || null
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      userId: doc.userId,
      type: doc.type,
      channelId: doc.channelId,
      messageId: doc.messageId,
      senderId: doc.senderId,
      content: doc.content,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      readAt: doc.readAt
    };
  }

  async findAllByUserId(tenantId, userId) {
    const docs = await this.collection
      .find({ tenantId, userId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }

  async markAsRead(notificationId, tenantId, userId) {
    const now = new Date();

    await this.collection.updateOne(
      {
        _id: notificationId,
        tenantId,
        userId
      },
      {
        $set: {
          isRead: true,
          readAt: now
        }
      }
    );

    const doc = await this.collection.findOne({
      _id: notificationId,
      tenantId,
      userId
    });

    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      id: _id,
      ...rest
    };
  }

  async countUnreadByUserId(tenantId, userId) {
    return this.collection.countDocuments({
      tenantId,
      userId,
      isRead: false
    });
  }
}