import crypto from "crypto";
import { db } from "../database/mongoClient.js";
import { StreamPresenceRepository } from "../../domain/ports/StreamPresenceRepository.js";

export class MongoStreamPresenceRepository extends StreamPresenceRepository {
  constructor() {
    super();
    this.collection = db.collection("stream_presences");
  }

  async startPresence(data) {
    const now = new Date();

    const doc = {
      _id: crypto.randomUUID(),
      tenantId: data.tenantId,
      streamId: data.streamId,
      userId: data.userId,
      email: data.email,
      role: data.role || "viewer",
      joinedAt: now,
      leftAt: null,
      durationSeconds: null
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      ...doc,
      _id: undefined
    };
  }

  async endPresence({ tenantId, streamId, userId }) {
    const now = new Date();

    const activePresence = await this.collection.findOne(
      {
        tenantId,
        streamId,
        userId,
        leftAt: null
      },
      {
        sort: { joinedAt: -1 }
      }
    );

    if (!activePresence) return null;

    const durationSeconds = Math.floor(
      (now.getTime() - new Date(activePresence.joinedAt).getTime()) / 1000
    );

    await this.collection.updateOne(
      { _id: activePresence._id },
      {
        $set: {
          leftAt: now,
          durationSeconds
        }
      }
    );

    const updated = await this.collection.findOne({ _id: activePresence._id });

    const { _id, ...rest } = updated;

    return {
      id: _id,
      ...rest
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
}