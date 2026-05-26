import { connectDB } from "../database/mongoClient.js";

function mapTraining(doc) {
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return rest;
}

export class MongoTrainingRepository {
  async create(training) {
    const db = await connectDB();
    await db.collection("trainings").insertOne(training);
    return training;
  }

  async findAll() {
    const db = await connectDB();
    const docs = await db.collection("trainings").find().toArray();
    return docs.map(mapTraining);
  }

  async findById(id) {
    const db = await connectDB();
    const doc = await db.collection("trainings").findOne({ id });
    return mapTraining(doc);
  }
}