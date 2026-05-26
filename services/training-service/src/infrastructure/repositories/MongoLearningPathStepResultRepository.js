import { connectDB } from "../database/mongoClient.js";

function map(doc) {
  if (!doc) return null;

  const { _id, ...rest } = doc;

  return {
    id: _id.toString(),
    ...rest
  };
}

export class MongoLearningPathStepResultRepository {
  async collection() {
    const db = await connectDB();

    return db.collection("learning_path_step_results");
  }

  async create(data) {
    const collection = await this.collection();

    const resultData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(resultData);

    return {
      id: result.insertedId.toString(),
      ...resultData
    };
  }

  async findByUserId(userId) {
    const collection = await this.collection();

    const docs = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(map);
  }

  async findByPathId(pathId) {
    const collection = await this.collection();

    const docs = await collection
      .find({ pathId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(map);
  }

  async findByStepId(stepId) {
    const collection = await this.collection();

    const docs = await collection
      .find({ stepId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(map);
  }

  async findOne({ pathId, stepId, userId }) {
    const collection = await this.collection();

    const doc = await collection.findOne({
      pathId,
      stepId,
      userId
    });

    return map(doc);
  }

  async upsert(data) {
    const collection = await this.collection();

    await collection.updateOne(
      {
        pathId: data.pathId,
        stepId: data.stepId,
        userId: data.userId
      },
      {
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      {
        upsert: true
      }
    );

    return data;
  }
  async findByUserIdAndPathId(userId, pathId) {
    const collection = await this.collection();

    const docs = await collection
      .find({ userId, pathId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(map);
  }
  async markMoodleSynced({ pathId, stepId, userId, moodleNoteSyncedAt }) {
    const collection = await this.collection();

    await collection.updateOne(
      { pathId, stepId, userId },
      {
        $set: {
          moodleNoteSynced: true,
          moodleNoteSyncedAt,
          updatedAt: new Date()
        }
      }
    );

    return this.findOne({ pathId, stepId, userId });
  }
}