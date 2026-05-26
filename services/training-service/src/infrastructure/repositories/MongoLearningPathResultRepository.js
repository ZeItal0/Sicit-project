import { ObjectId } from "mongodb";
import { connectDB } from "../database/mongoClient.js";

export class MongoLearningPathResultRepository {
    async collection() {
        const db = await connectDB();
        return db.collection("learning_path_results");
    }

    async create(data) {
        const collection = await this.collection();

        const resultData = {
            ...data,
            generatedAt: new Date()
        };

        const result = await collection.insertOne(resultData);

        return {
            id: result.insertedId.toString(),
            ...resultData
        };
    }

    async findByPathId(pathId) {
        const collection = await this.collection();

        const results = await collection.find({ pathId }).toArray();

        return results.map((item) => ({
            id: item._id.toString(),
            ...item
        }));
    }

    async findByUserId(userId) {
        const collection = await this.collection();

        const results = await collection.find({ userId }).toArray();

        return results.map((item) => ({
            id: item._id.toString(),
            ...item
        }));
    }

    async findByUserIdAndPathId(userId, pathId) {
        const collection = await this.collection();

        const result = await collection.findOne({ userId, pathId });

        if (!result) return null;

        return {
            id: result._id.toString(),
            ...result
        };
    }

    async update(id, data) {
        const collection = await this.collection();

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
        );

        return { id, ...data };
    }

    async findAll() {
        const collection = await this.collection();

        const results = await collection.find({}).toArray();

        return results.map((item) => ({
            id: item._id.toString(),
            ...item
        }));
    }
}