import crypto from "crypto";
import { db } from "../database/mongoClient.js";
import { StreamSessionRepository } from "../../domain/ports/StreamSessionRepository.js";

export class MongoStreamSessionRepository extends StreamSessionRepository {
  constructor() {
    super();
    this.collection = db.collection("stream_sessions");
  }

  async create(data) {
    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      title: data.title,
      description: data.description,
      hostId: data.hostId,
      status: data.status,
      visibility: data.visibility,
      chatChannelId: data.chatChannelId || null,
      createdAt: data.createdAt || new Date(),
      startedAt: data.startedAt || null,
      endedAt: data.endedAt || null,
      sectorId: data.sectorId || null,
      recordingUrl: data.recordingUrl || null,
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      title: doc.title,
      description: doc.description,
      hostId: doc.hostId,
      status: doc.status,
      visibility: doc.visibility,
      chatChannelId: doc.chatChannelId,
      createdAt: doc.createdAt,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      sectorId: doc.sectorId,
      recordingUrl: doc.recordingUrl,
    };
  }

  async findAllByTenantId(tenantId) {
    const docs = await this.collection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }

  async findById(id) {
    const doc = await this.collection.findOne({ _id: id });

    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      id: _id,
      ...rest
    };
  }

  async updateStatus(id, statusData) {
    await this.collection.updateOne(
      { _id: id },
      {
        $set: statusData
      }
    );

    return this.findById(id);
  }
  async findEndedByTenantId(tenantId) {
    const docs = await this.collection
      .find({
        tenantId,
        status: {
          $in: ["live", "ended"],
        },
        sectorId: {
          $ne: null,
        },
      })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest,
    }));
  }
  async updateRecordingUrl(id, recordingUrl) {
    await this.collection.updateOne(
      { _id: id },
      {
        $set: {
          recordingUrl,
          updatedAt: new Date()
        }
      }
    );

    return this.findById(id);
  }
}