import { connectDB } from "../database/mongoClient.js";

function mapResult(doc) {
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return rest;
}

export class MongoTrainingResultRepository {
  async upsert(result) {
    const db = await connectDB();

    await db.collection("training_results").updateOne(
      {
        trainingId: result.trainingId,
        userId: result.userId
      },
      {
        $set: result
      },
      { upsert: true }
    );

    const saved = await db.collection("training_results").findOne({
      trainingId: result.trainingId,
      userId: result.userId
    });

    return mapResult(saved);
  }

  async findByTrainingId(trainingId) {
    const db = await connectDB();

    const docs = await db
      .collection("training_results")
      .find({ trainingId })
      .sort({ generatedAt: -1 })
      .toArray();

    return docs.map(mapResult);
  }

  async findByUserId(userId) {
    const db = await connectDB();

    const docs = await db
      .collection("training_results")
      .find({ userId })
      .sort({ generatedAt: -1 })
      .toArray();

    return docs.map(mapResult);
  }
}