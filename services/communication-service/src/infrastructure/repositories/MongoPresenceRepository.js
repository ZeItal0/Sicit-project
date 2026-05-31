import crypto from "crypto";
import { PresenceRepository } from "../../domain/ports/PresenceRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoPresenceRepository extends PresenceRepository {
  constructor() {
    super();
    this.collection = db.collection("presences");
  }

  async setOnline({ tenantId, userId, socketId }) {
    const now = new Date();

    await this.collection.updateOne(
      { tenantId, userId },
      {
        $set: {
          tenantId,
          userId,
          status: "online",
          socketId,
          updatedAt: now
        },
        $setOnInsert: {
          _id: crypto.randomUUID(),
          lastSeenAt: now
        }
      },
      { upsert: true }
    );

    const doc = await this.collection.findOne({ tenantId, userId });

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      userId: doc.userId,
      status: doc.status,
      socketId: doc.socketId,
      lastSeenAt: doc.lastSeenAt,
      updatedAt: doc.updatedAt
    };
  }

  async setOffline({ tenantId, userId }) {
    const now = new Date();

    await this.collection.updateOne(
      { tenantId, userId },
      {
        $set: {
          status: "offline",
          socketId: null,
          lastSeenAt: now,
          updatedAt: now
        }
      }
    );

    const doc = await this.collection.findOne({ tenantId, userId });

    if (!doc) return null;

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      userId: doc.userId,
      status: doc.status,
      socketId: doc.socketId,
      lastSeenAt: doc.lastSeenAt,
      updatedAt: doc.updatedAt
    };
  }

  async findByUserId(tenantId, userId) {
    const doc = await this.collection.findOne({ tenantId, userId });

    if (!doc) return null;

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      userId: doc.userId,
      status: doc.status,
      socketId: doc.socketId,
      lastSeenAt: doc.lastSeenAt,
      updatedAt: doc.updatedAt
    };
  }

  async findAllByTenantId(tenantId) {
    const docs = await this.collection.find({ tenantId }).toArray();

    return docs.map((doc) => ({
      id: doc._id,
      tenantId: doc.tenantId,
      userId: doc.userId,
      status: doc.status,
      socketId: doc.socketId,
      lastSeenAt: doc.lastSeenAt,
      updatedAt: doc.updatedAt
    }));
  }
}