import { connectDB } from "../database/mongoClient.js";

function mapEvent(doc) {
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return rest;
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export class MongoAuditEventRepository {
  async create(event) {
    const db = await connectDB();

    await db.collection("audit_events").insertOne(event);

    return event;
  }

  async findAll(filters = {}) {
    const db = await connectDB();

    const query = {};
    const tenantQuery = {};

    if (filters.tenantId) {
      query.tenantId = filters.tenantId;
      tenantQuery.tenantId = filters.tenantId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.resourceType) {
      query.resourceType = filters.resourceType;
    }

    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (filters.search) {
      const search = new RegExp(String(filters.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      query.$or = [
        { action: search },
        { userEmail: search },
        { userId: search },
        { resourceType: search },
        { resourceId: search },
        { "metadata.title": search },
      ];
    }

    if (filters.page || filters.paginated === "true") {
      const page = toPositiveInt(filters.page, 1);
      const limit = Math.min(toPositiveInt(filters.limit, 10), 100);
      const skip = (page - 1) * limit;
      const collection = db.collection("audit_events");

      const [docs, total, actions, lastEvent, todayEvents, totalEvents, uniqueUsers, criticalEvents] = await Promise.all([
        collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
        collection.distinct("action", tenantQuery),
        collection.find(tenantQuery).sort({ createdAt: -1 }).limit(1).next(),
        collection.countDocuments({
          ...tenantQuery,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
        collection.countDocuments(tenantQuery),
        collection.distinct("userId", tenantQuery),
        collection.countDocuments({
          ...tenantQuery,
          action: /(DELETE|REMOVED|DISABLED|ERROR|FAILED)/,
        }),
      ]);

      return {
        items: docs.map(mapEvent),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        actions: actions.filter(Boolean),
        summary: {
          totalEvents,
          todayEvents,
          uniqueUsers: uniqueUsers.filter(Boolean).length,
          criticalEvents,
          lastEvent: mapEvent(lastEvent),
        },
      };
    }

    const docs = await db
      .collection("audit_events")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(filters.limit) || 100)
      .toArray();

    return docs.map(mapEvent);
  }
}
