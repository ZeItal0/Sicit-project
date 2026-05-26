import crypto from "crypto";

export class LearningPathStepResult {
  constructor({
    id = crypto.randomUUID(),
    tenantId,
    pathId,
    stepId,
    streamId,
    userId,
    userName,
    attendancePercent = 0,
    requiredPercent = 80,
    approved = false,
    completedAt = new Date(),
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;

    this.tenantId = tenantId;

    this.pathId = pathId;
    this.stepId = stepId;
    this.streamId = streamId;

    this.userId = userId;
    this.userName = userName;

    this.attendancePercent = Number(attendancePercent);
    this.requiredPercent = Number(requiredPercent);

    this.approved = approved;

    this.completedAt = completedAt;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}