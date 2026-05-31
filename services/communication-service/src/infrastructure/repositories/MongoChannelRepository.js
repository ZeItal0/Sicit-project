import crypto from "crypto";
import { ChannelRepository } from "../../domain/ports/ChannelRepository.js";
import { db } from "../database/mongoClient.js";

export class MongoChannelRepository extends ChannelRepository {
  constructor() {
    super();
    this.collection = db.collection("channels");
  }

  async create(data) {
    const doc = {
      _id: data.id || crypto.randomUUID(),
      tenantId: data.tenantId,
      name: data.name,
      description: data.description,
      type: data.type,
      createdBy: data.createdBy,
      createdAt: data.createdAt || new Date()
    };

    await this.collection.insertOne(doc);

    return {
      id: doc._id,
      tenantId: doc.tenantId,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt
    };
  }

  async findAllByTenantId(tenantId) {
    const docs = await this.collection
      .find({ tenantId })
      .sort({ createdAt: 1 })
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

  async findDirectChannelByIdList(tenantId, channelIds) {
    if (!channelIds.length) return null;

    const doc = await this.collection.findOne({
      tenantId,
      type: "direct",
      _id: { $in: channelIds }
    });

    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      id: _id,
      ...rest
    };
  }

  async findAllDirectChannelsByIds(tenantId, channelIds) {
    if (!channelIds.length) return [];

    const docs = await this.collection
      .find({
        tenantId,
        type: "direct",
        _id: { $in: channelIds }
      })
      .sort({ createdAt: 1 })
      .toArray();

    return docs.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
  }
}