import crypto from "crypto";

export class LearningPath {
  constructor({
    id = crypto.randomUUID(),
    tenantId,
    title,
    description,
    color = "#D7C900",
    icon = "🎓",
    minCompletionPercent = 80,
    deadline = null,
    sectorIds = [],
    steps = [],
    status = "PUBLISHED",
    createdBy,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.title = title;
    this.description = description;
    this.color = color;
    this.icon = icon;
    this.minCompletionPercent = Number(minCompletionPercent) || 80;
    this.deadline = deadline;
    this.sectorIds = sectorIds;
    this.steps = steps.map((step, index) => ({
      id: step.id || crypto.randomUUID(),
      title: step.title || "Vazio",
      description: step.description || "",
      type: step.type || "LIVE",
      order: step.order || index + 1,
      requiredPercent: Number(step.requiredPercent) || 80,
      estimatedMinutes: Number(step.estimatedMinutes) || 0,
      streamId: step.streamId || null,
      status: step.status || "PENDING_LINK"
    }));
    this.status = status;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}