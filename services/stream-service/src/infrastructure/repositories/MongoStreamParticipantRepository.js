import crypto from "crypto";
import { db } from "../database/mongoClient.js";
import { StreamParticipantRepository } from "../../domain/ports/StreamParticipantRepository.js";

export class MongoStreamParticipantRepository extends StreamParticipantRepository {
  constructor() {
    super();
    this.collection = db.collection("stream_participants");
  }

  async create(data) {
    const existing = await this.collection.findOne({
      streamId: data.streamId,
      userId: data.userId
    });

    if (existing) {
      return {
        id: existing._id,
        tenantId: existing.tenantId,
        streamId: existing.streamId,
        userId: existing.userId,
        role: existing.role,
        joinedAt: existing.joinedAt
      };
    }

    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      streamId: data.streamId,
      userId: data.userId,
      role: data.role || "viewer",
      joinedAt: data.joinedAt || new Date()
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      streamId: doc.streamId,
      userId: doc.userId,
      role: doc.role,
      joinedAt: doc.joinedAt
    };
  }

  async findByStreamId(streamId) {
    const docs = await this.collection
      .find({ streamId })
      .sort({ joinedAt: 1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }

  async findByStreamIdAndUserId(streamId, userId) {
    const doc = await this.collection.findOne({ streamId, userId });

    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      id: _id,
      ...rest
    };
  }
}