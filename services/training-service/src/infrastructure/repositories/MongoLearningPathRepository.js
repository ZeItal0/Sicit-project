import { connectDB } from "../database/mongoClient.js";

function mapPath(doc) {
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return rest;
}

export class MongoLearningPathRepository {
  async collection() {
    const db = await connectDB();
    return db.collection("learning_paths");
  }

  async create(path) {
    const collection = await this.collection();

    await collection.insertOne(path);

    return path;
  }

  async findAll({ tenantId } = {}) {
    const collection = await this.collection();

    const filter = tenantId ? { tenantId } : {};

    const docs = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(mapPath);
  }

  async findById(id) {
    const collection = await this.collection();

    const doc = await collection.findOne({ id });

    return mapPath(doc);
  }

  async findBySectorId({ tenantId, sectorId }) {
    const collection = await this.collection();

    const docs = await collection
      .find({
        tenantId,
        sectorIds: sectorId,
        status: "PUBLISHED"
      })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(mapPath);
  }

  async assignStreamToStep({ pathId, stepId, streamId, streamTitle }) {
    const collection = await this.collection();

    await collection.updateOne(
      {
        id: pathId,
        "steps.id": stepId
      },
      {
        $set: {
          "steps.$.streamId": streamId,
          "steps.$.streamTitle": streamTitle,
          "steps.$.title": streamTitle,
          "steps.$.status": "LINKED",
          updatedAt: new Date()
        }
      }
    );

    return this.findById(pathId);
  }

  async updateMoodleSync({ pathId, moodleCourseId, moodleShortname }) {
    const collection = await this.collection();

    const path = await this.findById(pathId);

    const steps = (path?.steps || []).map((step, index) => ({
      ...step,
      moodleSection: index + 1
    }));

    await collection.updateOne(
      { id: pathId },
      {
        $set: {
          moodleCourseId,
          moodleShortname,
          steps,
          moodleSyncedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return this.findById(pathId);
  }

  async updateMoodleEnrolments({ pathId, enrolments }) {
  const collection = await this.collection();

  await collection.updateOne(
    { id: pathId },
    {
      $set: {
        moodleEnrolments: enrolments,
        moodleEnrolmentsSyncedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  return this.findById(pathId);
}
}