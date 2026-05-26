export class LearningPathResult {
  constructor({
    id,
    pathId,
    userId,
    completedTrainings,
    totalTrainings,
    completionPercent,
    approved,
    generatedAt
  }) {
    this.id = id;
    this.pathId = pathId;
    this.userId = userId;
    this.completedTrainings = completedTrainings;
    this.totalTrainings = totalTrainings;
    this.completionPercent = completionPercent;
    this.approved = approved;
    this.generatedAt = generatedAt || new Date();
  }
}